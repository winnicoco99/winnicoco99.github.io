/* ============================================================
   作息 —— 起床/上班/下班/睡觉四次打卡，配统计和条带图
   ------------------------------------------------------------
   数据模型（localStorage，key = workbench.rhythm）

     { "2026-08-31": { wake:420, work:570, off:1140, sleep:1500 }, ... }

   值是「距该逻辑日 00:00 的分钟数」，允许 ≥1440 表示跨了半夜。
   例：凌晨 1:00 睡下记成 1500（25:00），仍归属前一天。

   为什么不用时间戳：作息关心的是「几点」，分钟数直接可比可平均，
   也不受时区和夏令时影响。

   ⛔ 逻辑日的分界是凌晨 4 点（DAY_CUT），不是 0 点。
   凌晨两点点「睡觉」必须算前一天的，否则这一天会缺睡眠、
   而第二天会出现「先睡后起」的乱序。改这个常量前想清楚。
   ============================================================ */

(function () {
  'use strict';

  const DAY_CUT = 4 * 60;          // 逻辑日分界：04:00
  const WIN_START = 4 * 60;        // 条带图左端 04:00
  const WIN_END = 36 * 60;         // 条带图右端 次日 12:00
  const WIN_SPAN = WIN_END - WIN_START;   // 32 小时
  const LOG_FOLD = 14;             // 历史默认显示条数

  /* 统计周期。每种都给出「当前区间」和「用来对比的上一个区间」，
     所以对比逻辑只写一遍，不用为周/月各写一套。
     rolling 是默认项 —— 刚开始用的时候本周可能只有一两天，
     滚动 7 天更有参考价值。 */
  const PERIODS = [
    { key: 'rolling', name: '近 7 天', unit: 'day',  prevName: '前 7 天' },
    { key: 'week',    name: '本周',    unit: 'week', prevName: '上周' },
    { key: 'month',   name: '本月',    unit: 'month', prevName: '上月' }
  ];

  // 打卡项的顺序就是一天的推进顺序，「建议下一个」靠它判断
  const KINDS = [
    { key: 'wake',  name: '起床', label: 'Wake' },
    { key: 'work',  name: '上班', label: 'Work In' },
    { key: 'off',   name: '下班', label: 'Work Out' },
    { key: 'sleep', name: '睡觉', label: 'Sleep' }
  ];

  // 睡觉、下班可能落在半夜之后，输入小于分界就算跨天
  const CAN_CROSS = { sleep: true, off: true, wake: false, work: false };

  const store = new Store('rhythm');

  /* ---------- 时间与日期 ---------- */

  const pad = n => String(n).padStart(2, '0');

  /** Date → 'YYYY-MM-DD' */
  function dkey(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /** 'YYYY-MM-DD' → Date（本地零点） */
  function dparse(k) {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function shiftKey(k, days) {
    const d = dparse(k);
    d.setDate(d.getDate() + days);
    return dkey(d);
  }

  /** 现在属于哪个逻辑日 + 当前分钟数（跨了半夜就 +1440） */
  function nowPoint() {
    const n = new Date();
    let m = n.getHours() * 60 + n.getMinutes();
    let d = new Date(n);
    if (m < DAY_CUT) { d.setDate(d.getDate() - 1); m += 1440; }
    return { key: dkey(d), min: m };
  }

  /** 分钟数 → 'HH:MM'，跨天的取模显示真实钟点 */
  function fmt(m) {
    if (m == null) return null;
    const v = ((m % 1440) + 1440) % 1440;
    return pad(Math.floor(v / 60)) + ':' + pad(v % 60);
  }

  /** 时长 → '7h20' 这种紧凑写法，单位小一号 */
  function fmtDur(m) {
    if (m == null) return null;
    const h = Math.floor(m / 60), mm = Math.round(m % 60);
    return `${h}<span class="s-unit">h</span>${pad(mm)}`;
  }

  function fmtDurPlain(m) {
    if (m == null) return '';
    return `${Math.floor(m / 60)}h${pad(Math.round(m % 60))}`;
  }

  const mdLabel = k => k.slice(5).replace('-', '/');
  const weekOf = k => '日一二三四五六'[dparse(k).getDay()];

  /** 该日期所在周的周一（周一为一周之始，符合国内习惯） */
  function mondayOf(k) {
    const d = dparse(k);
    const off = (d.getDay() + 6) % 7;    // 周一=0 … 周日=6
    d.setDate(d.getDate() - off);
    return dkey(d);
  }

  /** 列出 [from, to] 之间的所有日期 key，含两端 */
  function rangeKeys(from, to) {
    const out = [];
    let cur = from;
    // 用日期推进而不是算天数差，自动躲开夏令时和月末长度问题
    while (cur <= to) { out.push(cur); cur = shiftKey(cur, 1); }
    return out;
  }

  /**
   * 按周期算出「本期」和「上期」的日期区间。
   * 上期一律取完整的上一个自然周期，不做「对齐到今天」的截断 ——
   * 月初比较时确实会拿不满的本月对满的上月，但截断更难解释，
   * 而且摘要里已经标了各自天数。
   */
  function periodRange(periodKey, todayKey) {
    if (periodKey === 'week') {
      const cs = mondayOf(todayKey);
      const ps = shiftKey(cs, -7);
      return {
        cur: { start: cs, end: todayKey },
        prev: { start: ps, end: shiftKey(cs, -1) }
      };
    }
    if (periodKey === 'month') {
      const d = dparse(todayKey);
      const cs = dkey(new Date(d.getFullYear(), d.getMonth(), 1));
      const pd = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const ps = dkey(pd);
      return {
        cur: { start: cs, end: todayKey },
        prev: { start: ps, end: shiftKey(cs, -1) }
      };
    }
    // rolling：今天往回 7 天，对比再往前 7 天
    return {
      cur: { start: shiftKey(todayKey, -6), end: todayKey },
      prev: { start: shiftKey(todayKey, -13), end: shiftKey(todayKey, -7) }
    };
  }

  /* ---------- 数据读写 ---------- */

  // 只接受对象，导入了结构不对的数据也不至于崩
  const asMap = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};

  let data = asMap(store.load({}));
  let logAll = false;
  let chartDays = 14;
  let editKey = null;      // 编辑面板正在编哪一天，null = 收起
  let period = 'rolling';  // 统计周期，见 PERIODS

  function persist() { store.save(data); }

  function dayOf(k) { return data[k] || null; }

  /** 该日睡眠时长：本日睡点 → 次日起床点 */
  function sleepDur(k) {
    const a = dayOf(k), b = dayOf(shiftKey(k, 1));
    if (!a || a.sleep == null || !b || b.wake == null) return null;
    const dur = (b.wake + 1440) - a.sleep;
    return dur > 0 && dur < 1080 ? dur : null;   // 超过 18h 视为漏打卡
  }

  function workDur(k) {
    const a = dayOf(k);
    if (!a || a.work == null || a.off == null) return null;
    const dur = a.off - a.work;
    return dur > 0 ? dur : null;
  }

  /** 有记录的日期，新→旧 */
  function sortedKeys() {
    return Object.keys(data)
      .filter(k => {
        const v = data[k];
        return v && KINDS.some(x => v[x.key] != null);
      })
      .sort((a, b) => b.localeCompare(a));
  }

  /* ---------- 打卡区 ---------- */

  function renderPunch() {
    const { key: today, min: nowMin } = nowPoint();
    const rec = dayOf(today) || {};

    document.getElementById('today-label').textContent =
      `${mdLabel(today)} 周${weekOf(today)}`;

    // 建议下一个：第一个还没打的
    const next = KINDS.find(k => rec[k.key] == null);

    const grid = document.getElementById('punch-grid');
    grid.innerHTML = '';

    KINDS.forEach(k => {
      const has = rec[k.key] != null;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'punch ' + (has ? 'done' : 'blank') +
        (next && next.key === k.key ? ' suggest' : '');
      btn.innerHTML = `
        <div class="pk-label">${k.label}</div>
        <div class="pk-name"></div>
        <div class="pk-time">${has ? fmt(rec[k.key]) : '--:--'}</div>`;
      btn.querySelector('.pk-name').textContent = k.name;

      btn.onclick = () => {
        if (rec[k.key] == null) {
          // 空的就直接记当前时间，这是最高频路径，一次点击完成
          setPunch(today, k.key, nowPoint().min);
        } else {
          // 已经有值，点它是想改 —— 打开编辑面板而不是覆盖
          if (editKey === today) closeEditor();
          else {
            openEditor(today);
            // 打开后把焦点直接送到被点的那一项，少一次点击
            const target = edInputs && edInputs[k.key];
            if (target) target.focus();
          }
        }
      };
      grid.appendChild(btn);
    });

    const hintEl = document.getElementById('punch-hint');
    const doneCnt = KINDS.filter(k => rec[k.key] != null).length;
    if (!doneCnt) {
      hintEl.textContent = '点一下就记下当前时间，凌晨 4 点前算前一天';
    } else if (next) {
      hintEl.textContent = `已记 ${doneCnt}/4 · 再点已记下的可以改时间`;
    } else {
      hintEl.textContent = '今天四项都记好了 · 点已记下的可以改时间';
    }

    // 时间会走，界面上的「现在」不刷新会显得不准
    void nowMin;
  }

  /* keepEditor=true 表示改动来自编辑面板自己，此时只刷新面板之外的部分。
     不这么做的话，写一次数据就重建一次面板，iOS 滚轮会被拔掉。 */
  function setPunch(key, kind, min, opt = {}) {
    if (!data[key]) data[key] = {};
    data[key][kind] = min;
    persist();
    opt.keepEditor ? renderExceptEditor() : renderAll();
  }

  function clearPunch(key, kind, opt = {}) {
    if (!data[key]) return;
    delete data[key][kind];
    if (!KINDS.some(k => data[key][k.key] != null)) delete data[key];
    persist();
    opt.keepEditor ? renderExceptEditor() : renderAll();
  }

  /* ---------- 编辑面板 ---------- */

  /* ⛔ 编辑面板必须「建一次就不动」，别改回每次 renderAll 都重建。

     踩过的坑（2026-08-31 修）：原来 renderEditor() 每次都
     `box.innerHTML = ...` 整块重建，而 input 的 change 里会调 renderAll。
     iOS 的时间滚轮**在拖动过程中就连续 fire change**，于是手指还没松开，
     输入框已经被连根拔掉重建 —— 表现是「拖一下选择器就没了」。

     现在的做法：
       openEditor()  只在打开/换天时建一次 DOM，建好就不碰
       syncEditor()  只在外部数据变化时回填 value，且跳过正在编辑的那个框
     数据写入走 setPunch(..., {keepEditor:true})，不重建面板。 */

  let edInputs = null;      // { wake: inputEl, ... }，面板打开期间有效

  function openEditor(key) {
    const box = document.getElementById('editor');
    editKey = key;
    box.hidden = false;
    box.innerHTML = `
      <div class="ed-head">
        <span class="overline sec">Edit</span>
        <span class="ed-date"></span>
      </div>
      <div class="ed-rows"></div>
      <div class="ed-foot">
        <button class="btn-ghost" type="button" data-close>收起</button>
        <span class="ed-tip">下班 / 睡觉 填 00:00–03:59 视为跨到次日凌晨</span>
      </div>`;
    box.querySelector('.ed-date').textContent =
      `${mdLabel(key)} 周${weekOf(key)}`;

    const rows = box.querySelector('.ed-rows');
    edInputs = {};

    KINDS.forEach(k => {
      const row = document.createElement('div');
      row.className = 'ed-row';
      row.innerHTML = `
        <span class="ed-name"></span>
        <input type="time" step="60">
        <button class="ed-clear" type="button" title="清除">×</button>`;
      row.querySelector('.ed-name').textContent = k.name;

      const input = row.querySelector('input');
      edInputs[k.key] = input;

      const commit = () => {
        if (!input.value) {
          clearPunch(editKey, k.key, { keepEditor: true });
          return;
        }
        const [h, mm] = input.value.split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(mm)) return;   // 滚轮拖到半途可能是空值
        let min = h * 60 + mm;
        // 下班/睡觉填了凌晨的钟点，意思是熬到了次日
        if (CAN_CROSS[k.key] && min < DAY_CUT) min += 1440;
        setPunch(editKey, k.key, min, { keepEditor: true });
      };

      // input 事件比 change 更早也更密，节流一下避免每一格滚动都写一次 localStorage
      let timer = null;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(commit, 260);
      });
      // change/blur 立即落地，防止节流还没触发用户就收起了面板
      input.addEventListener('change', () => { clearTimeout(timer); commit(); });
      input.addEventListener('blur',   () => { clearTimeout(timer); commit(); });

      row.querySelector('.ed-clear').onclick = () => {
        input.value = '';
        clearPunch(editKey, k.key, { keepEditor: true });
      };

      rows.appendChild(row);
    });

    box.querySelector('[data-close]').onclick = () => closeEditor();
    syncEditor();
  }

  function closeEditor() {
    const box = document.getElementById('editor');
    editKey = null;
    edInputs = null;
    box.hidden = true;
    box.innerHTML = '';
    renderAll();
  }

  /** 把数据回填到已有的输入框里，不重建 DOM */
  function syncEditor() {
    if (!editKey || !edInputs) return;
    const rec = dayOf(editKey) || {};
    KINDS.forEach(k => {
      const input = edInputs[k.key];
      if (!input) return;
      // 正在操作的那个框绝对不能动，否则 iOS 滚轮会被打断
      if (document.activeElement === input) return;
      const want = rec[k.key] != null ? fmt(rec[k.key]) : '';
      if (input.value !== want) input.value = want;
    });
  }

  /* ---------- 均值 ---------- */

  const avg = arr => arr.length
    ? arr.reduce((a, b) => a + b, 0) / arr.length
    : null;

  /** 统计一个日期区间。四项各自独立算，缺哪项只是那项为 null。 */
  function collectRange(start, end) {
    const wake = [], sleep = [], sdur = [], wdur = [];
    let logged = 0;

    rangeKeys(start, end).forEach(k => {
      const r = dayOf(k);
      if (r && KINDS.some(x => r[x.key] != null)) logged++;
      if (r && r.wake != null) wake.push(r.wake);
      if (r && r.sleep != null) sleep.push(r.sleep);
      const s = sleepDur(k); if (s != null) sdur.push(s);
      const w = workDur(k);  if (w != null) wdur.push(w);
    });

    return {
      wake: avg(wake), sleep: avg(sleep),
      sdur: avg(sdur), wdur: avg(wdur),
      logged,
      span: rangeKeys(start, end).length,
      n: { wake: wake.length, sleep: sleep.length, sdur: sdur.length, wdur: wdur.length }
    };
  }

  /* 四项指标的元信息集中在这里，渲染和摘要都读它，避免两处各写一遍。
     good 决定环比箭头的颜色语义：
       'less'  —— 数值变小是好事（起床早、入睡早、在岗短）
       'more'  —— 数值变大是好事（睡得久）
     注意起床/入睡是「时刻」，早一点是变小；睡眠/在岗是「时长」。 */
  const METRICS = [
    { key: 'wake',  cap: '平均起床', kind: 'clock', good: 'less' },
    { key: 'sleep', cap: '平均入睡', kind: 'clock', good: 'less' },
    { key: 'sdur',  cap: '平均睡眠', kind: 'dur',   good: 'more' },
    { key: 'wdur',  cap: '平均在岗', kind: 'dur',   good: 'less' }
  ];

  const showVal = (m, v) => v == null
    ? null
    : (m.kind === 'clock' ? fmt(Math.round(v)) : fmtDur(v));

  /**
   * 差值 → { text:'30m', dir:-1 }，绝对值 < 3 分钟当持平。
   * text 里**不带正负号** —— 方向由调用方的箭头表达，
   * 否则会渲染成「↓−30m」这种符号重复。
   */
  function fmtDelta(d) {
    const a = Math.abs(Math.round(d));
    if (a < 3) return { text: '持平', dir: 0 };
    const body = a >= 60 ? `${Math.floor(a / 60)}h${pad(a % 60)}` : `${a}m`;
    return { text: body, dir: d > 0 ? 1 : -1 };
  }

  function renderStats() {
    const today = nowPoint().key;
    const p = PERIODS.find(x => x.key === period) || PERIODS[0];
    const { cur, prev } = periodRange(p.key, today);
    const A = collectRange(cur.start, cur.end);
    const B = collectRange(prev.start, prev.end);

    // 区间说明放在标题右侧，让「这些数是哪几天的」一目了然
    document.getElementById('range-note').textContent =
      `${mdLabel(cur.start)}–${mdLabel(cur.end)} · 记了 ${A.logged} 天`;

    document.getElementById('stats').innerHTML = METRICS.map(m => {
      const now = showVal(m, A[m.key]);
      const was = showVal(m, B[m.key]);

      // 两期都有数才谈对比
      let cmp = '<div class="s-cmp empty">—</div>';
      if (A[m.key] != null && B[m.key] != null) {
        const d = fmtDelta(A[m.key] - B[m.key]);
        let cls = 'flat';
        if (d.dir !== 0) {
          const better = (m.good === 'less') ? d.dir < 0 : d.dir > 0;
          cls = better ? 'up' : 'down';
        }
        const arrow = d.dir === 0 ? '' : (d.dir > 0 ? '↑' : '↓');
        cmp = `<div class="s-cmp ${cls}">${arrow}${d.text}</div>`;
      } else if (B[m.key] != null) {
        cmp = `<div class="s-cmp empty">${p.prevName} ${was}</div>`;
      }

      return `
        <div class="stat">
          <div class="s-num${now ? '' : ' dim'}">${now || '--:--'}</div>
          <div class="s-cap">${m.cap}</div>
          ${cmp}
        </div>`;
    }).join('');

    renderCompareTable(p, A, B, cur, prev);
    renderSummary(p, A, B);
  }

  /** 两期并排的小表，给想看具体数字的时候用 */
  function renderCompareTable(p, A, B, cur, prev) {
    const box = document.getElementById('compare');

    if (!B.logged && !A.logged) {
      box.innerHTML = '';
      box.hidden = true;
      return;
    }
    box.hidden = false;

    const row = m => {
      const a = showVal(m, A[m.key]);
      const b = showVal(m, B[m.key]);
      let d = '<span class="dim">—</span>';
      if (A[m.key] != null && B[m.key] != null) {
        const f = fmtDelta(A[m.key] - B[m.key]);
        let cls = 'flat';
        if (f.dir !== 0) {
          const better = (m.good === 'less') ? f.dir < 0 : f.dir > 0;
          cls = better ? 'up' : 'down';
        }
        d = `<span class="${cls}">${f.dir === 0 ? '' : (f.dir > 0 ? '↑' : '↓')}${f.text}</span>`;
      }
      return `<tr>
        <th>${m.cap.replace('平均', '')}</th>
        <td>${a || '<span class="dim">--</span>'}</td>
        <td>${b || '<span class="dim">--</span>'}</td>
        <td class="c-delta">${d}</td>
      </tr>`;
    };

    box.innerHTML = `
      <table class="ctab">
        <thead>
          <tr>
            <th></th>
            <td>${p.name}<i>${A.logged}天</i></td>
            <td>${p.prevName}<i>${B.logged}天</i></td>
            <td>对比</td>
          </tr>
        </thead>
        <tbody>${METRICS.map(row).join('')}</tbody>
      </table>`;
  }

  function renderSummary(p, A, B) {
    const el = document.getElementById('summary');

    if (!A.logged) {
      el.innerHTML = `${p.name}还没有记录，打几次卡这里就会出现平均值。`;
      return;
    }

    // 一句话把四个数串起来，比让用户自己看数舒服
    const parts = [];
    if (A.sdur != null) {
      const tag = A.sdur >= 480 ? '睡得足' : A.sdur >= 420 ? '基本够' : '偏少';
      parts.push(`平均睡 <b>${fmtDurPlain(A.sdur)}</b>，${tag}`);
    }
    if (A.wdur != null) parts.push(`在岗 <b>${fmtDurPlain(A.wdur)}</b>`);
    if (A.sleep != null && A.wake != null) {
      parts.push(`作息大致 <b>${fmt(Math.round(A.sleep))}</b> 睡 <b>${fmt(Math.round(A.wake))}</b> 起`);
    }

    let text = parts.length
      ? `${p.name}${parts.join('，')}。`
      : `${p.name}记了 ${A.logged} 天，还凑不出完整的平均值。`;

    // 跟上期的差异单独说一句，只挑变化最明显的一项，不然太啰嗦
    if (B.logged) {
      const moved = METRICS
        .filter(m => A[m.key] != null && B[m.key] != null)
        .map(m => ({ m, d: A[m.key] - B[m.key] }))
        .filter(x => Math.abs(x.d) >= 3)
        .sort((x, y) => Math.abs(y.d) - Math.abs(x.d))[0];

      if (moved) {
        const f = fmtDelta(moved.d);
        const better = (moved.m.good === 'less') ? moved.d < 0 : moved.d > 0;
        const word = moved.m.kind === 'clock'
          ? (moved.d < 0 ? '早了' : '晚了')
          : (moved.d < 0 ? '少了' : '多了');
        text += ` 比${p.prevName}${moved.m.cap.replace('平均', '')}${word}` +
          ` <b>${f.text}</b>${better ? '，是往好的方向' : ''}。`;
      } else {
        text += ` 跟${p.prevName}基本持平。`;
      }
    }

    el.innerHTML = text;
  }

  /* ---------- 条带图 ---------- */

  const pct = m => Math.max(0, Math.min(100, (m - WIN_START) / WIN_SPAN * 100));

  function renderChart() {
    const box = document.getElementById('chart');
    box.innerHTML = '';

    const today = nowPoint().key;

    // 横轴：04 08 12 16 20 00 04 08 12
    const axis = document.createElement('div');
    axis.className = 'axis';
    for (let m = WIN_START; m <= WIN_END; m += 240) {
      const s = document.createElement('span');
      s.textContent = pad(Math.floor((m % 1440) / 60));
      const p = pct(m);
      s.style.left = p + '%';
      // 首尾贴边，避免溢出容器
      if (p > 95) s.style.transform = 'translateX(-100%)';
      else if (p > 2) s.style.transform = 'translateX(-50%)';
      axis.appendChild(s);
    }
    box.appendChild(axis);

    for (let i = chartDays - 1; i >= 0; i--) {
      const k = shiftKey(today, -i);
      const rec = dayOf(k);
      const nextRec = dayOf(shiftKey(k, 1));

      const row = document.createElement('div');
      row.className = 'crow' + (k === today ? ' is-today' : '');
      row.innerHTML = `<div class="crow-date">${mdLabel(k)}</div><div class="track"></div>`;
      const track = row.querySelector('.track');

      // 0 点参考线
      const mid = document.createElement('div');
      mid.className = 'mid';
      mid.style.left = pct(1440) + '%';
      track.appendChild(mid);

      if (rec) {
        // 在岗
        if (rec.work != null) {
          const end = rec.off != null ? rec.off : null;
          const seg = document.createElement('div');
          seg.className = 'seg seg-work' + (end == null ? ' open' : '');
          const a = pct(rec.work);
          const b = end != null ? pct(end) : pct(rec.work + 30);
          seg.style.left = a + '%';
          seg.style.width = Math.max(0.8, b - a) + '%';
          seg.title = `在岗 ${fmt(rec.work)} → ${end != null ? fmt(end) : '进行中'}`;
          track.appendChild(seg);
        }

        // 睡眠：本日睡点 → 次日起床点
        if (rec.sleep != null) {
          const wakeNext = (nextRec && nextRec.wake != null)
            ? nextRec.wake + 1440 : null;
          const seg = document.createElement('div');
          seg.className = 'seg seg-sleep' + (wakeNext == null ? ' open' : '');
          const a = pct(rec.sleep);
          const b = wakeNext != null ? pct(wakeNext) : pct(rec.sleep + 60);
          seg.style.left = a + '%';
          seg.style.width = Math.max(0.8, b - a) + '%';
          seg.title = wakeNext != null
            ? `睡 ${fmtDurPlain(wakeNext - rec.sleep)}`
            : `${fmt(rec.sleep)} 睡下，等次日起床打卡`;
          track.appendChild(seg);
        }

        // 起床时刻：一条竖线，用来看起床点的漂移
        if (rec.wake != null) {
          const mk = document.createElement('div');
          mk.className = 'mark-wake';
          mk.style.left = pct(rec.wake) + '%';
          mk.title = `起床 ${fmt(rec.wake)}`;
          track.appendChild(mk);
        }
      }

      box.appendChild(row);
    }

    const lg = document.createElement('div');
    lg.className = 'legend';
    lg.innerHTML = `
      <span class="lg-wake"><i></i>起床</span>
      <span><i style="background:var(--orange)"></i>在岗</span>
      <span><i style="background:#BDB4A2"></i>睡眠</span>`;
    box.appendChild(lg);
  }

  /* ---------- 历史 ---------- */

  function renderLog() {
    const keys = sortedKeys();
    const listEl = document.getElementById('hlist');
    const emptyEl = document.getElementById('empty');
    const moreEl = document.getElementById('more');

    emptyEl.style.display = keys.length ? 'none' : 'block';
    document.getElementById('log-count').textContent =
      keys.length ? `${pad(keys.length)} 天` : '';

    const shown = logAll ? keys : keys.slice(0, LOG_FOLD);
    listEl.innerHTML = '';

    shown.forEach(k => {
      const r = data[k];
      const cell = v => v != null
        ? fmt(v)
        : '<span class="miss">--:--</span>';

      const li = document.createElement('li');
      li.className = 'hrow' + (k === nowPoint().key ? ' is-today' : '');
      const s = sleepDur(k), w = workDur(k);
      li.innerHTML = `
        <div class="h-date">${mdLabel(k)} ${weekOf(k)}</div>
        <div class="h-times">
          ${cell(r.wake)}<span class="sep">起</span>${cell(r.work)}<span class="sep">上</span>${cell(r.off)}<span class="sep">下</span>${cell(r.sleep)}<span class="sep">睡</span>
        </div>
        <div class="h-dur">${[
          s != null ? '睡' + fmtDurPlain(s) : '',
          w != null ? '岗' + fmtDurPlain(w) : ''
        ].filter(Boolean).join(' · ')}</div>`;

      li.onclick = () => {
        if (editKey === k) { closeEditor(); return; }
        openEditor(k);
        document.getElementById('editor')
          .scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      listEl.appendChild(li);
    });

    moreEl.hidden = keys.length <= LOG_FOLD;
    moreEl.textContent = logAll ? '收起' : `显示全部 ${keys.length} 天`;
  }

  /* ---------- 备份 ---------- */

  function bindBackup() {
    document.getElementById('export').onclick = () => store.exportFile();

    document.getElementById('import').onclick = () => {
      store.importFile(raw => {
        const incoming = asMap(raw);
        const days = Object.keys(incoming).length;
        if (!days) { alert('备份里没有可导入的内容'); return; }

        const mine = Object.keys(data).length;
        if (mine) {
          const merge = confirm(
            `备份里有 ${days} 天，当前有 ${mine} 天。\n\n` +
            '确定 = 合并（同一天里缺的项用备份补上）\n取消 = 用备份完全替换'
          );
          if (merge) {
            Object.keys(incoming).forEach(k => {
              const src = incoming[k] || {};
              if (!data[k]) data[k] = {};
              // 只补空缺，不覆盖本机已有的值
              KINDS.forEach(x => {
                if (data[k][x.key] == null && src[x.key] != null) {
                  data[k][x.key] = src[x.key];
                }
              });
            });
            alert('已合并');
          } else {
            data = incoming;
            alert(`已替换为备份内容，共 ${days} 天`);
          }
        } else {
          data = incoming;
          alert(`已恢复 ${days} 天`);
        }
        persist();
        renderAll();
      });
    };
  }

  /* ---------- 启动 ---------- */

  /** 面板之外的部分。编辑面板自己触发的改动走这条，避免拔掉输入框 */
  function renderExceptEditor() {
    renderPunch();
    renderStats();
    renderChart();
    renderLog();
    syncEditor();     // 只回填 value，不重建
  }

  function renderAll() {
    renderExceptEditor();
  }

  // 周期切换：段落式分段控件，点一下换周期
  const segBox = document.getElementById('period-seg');
  PERIODS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pseg-btn' + (p.key === period ? ' on' : '');
    b.dataset.k = p.key;
    b.textContent = p.name;
    b.onclick = () => {
      period = p.key;
      segBox.querySelectorAll('.pseg-btn').forEach(x =>
        x.classList.toggle('on', x.dataset.k === period));
      renderStats();
    };
    segBox.appendChild(b);
  });

  document.getElementById('more').onclick = () => {
    logAll = !logAll;
    renderLog();
  };

  const spanBtn = document.getElementById('span-toggle');
  spanBtn.onclick = () => {
    chartDays = chartDays === 14 ? 30 : 14;
    spanBtn.textContent = `近 ${chartDays} 天`;
    renderChart();
  };

  bindBackup();
  renderAll();

  // 从后台切回来时日期可能已经翻篇，重画一次
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderAll();
  });
})();
