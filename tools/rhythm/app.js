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
  const AVG_DAYS = 7;              // 均值窗口
  const LOG_FOLD = 14;             // 历史默认显示条数

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

  /* ---------- 数据读写 ---------- */

  // 只接受对象，导入了结构不对的数据也不至于崩
  const asMap = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};

  let data = asMap(store.load({}));
  let logAll = false;
  let chartDays = 14;
  let editKey = null;      // 编辑面板正在编哪一天，null = 收起

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
          editKey = (editKey === today) ? null : today;
          renderAll();
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

  function setPunch(key, kind, min) {
    if (!data[key]) data[key] = {};
    data[key][kind] = min;
    persist();
    renderAll();
  }

  function clearPunch(key, kind) {
    if (!data[key]) return;
    delete data[key][kind];
    if (!KINDS.some(k => data[key][k.key] != null)) delete data[key];
    persist();
    renderAll();
  }

  /* ---------- 编辑面板 ---------- */

  function renderEditor() {
    const box = document.getElementById('editor');
    if (!editKey) { box.hidden = true; box.innerHTML = ''; return; }

    const rec = dayOf(editKey) || {};
    box.hidden = false;
    box.innerHTML = `
      <div class="ed-head">
        <span class="overline sec">Edit</span>
        <span class="ed-date">${mdLabel(editKey)} 周${weekOf(editKey)}</span>
      </div>
      <div class="ed-rows"></div>
      <div class="ed-foot">
        <button class="btn-ghost" type="button" data-close>收起</button>
        <span class="ed-tip">下班 / 睡觉 填 00:00–03:59 视为跨到次日凌晨</span>
      </div>`;

    const rows = box.querySelector('.ed-rows');
    KINDS.forEach(k => {
      const row = document.createElement('div');
      row.className = 'ed-row';
      row.innerHTML = `
        <span class="ed-name"></span>
        <input type="time" value="${rec[k.key] != null ? fmt(rec[k.key]) : ''}">
        <button class="ed-clear" type="button" title="清除">×</button>`;
      row.querySelector('.ed-name').textContent = k.name;

      const input = row.querySelector('input');
      input.onchange = () => {
        if (!input.value) { clearPunch(editKey, k.key); return; }
        const [h, mm] = input.value.split(':').map(Number);
        let min = h * 60 + mm;
        // 下班/睡觉填了凌晨的钟点，意思是熬到了次日
        if (CAN_CROSS[k.key] && min < DAY_CUT) min += 1440;
        setPunch(editKey, k.key, min);
      };

      row.querySelector('.ed-clear').onclick = () => clearPunch(editKey, k.key);
      rows.appendChild(row);
    });

    box.querySelector('[data-close]').onclick = () => {
      editKey = null;
      renderAll();
    };
  }

  /* ---------- 均值 ---------- */

  const avg = arr => arr.length
    ? arr.reduce((a, b) => a + b, 0) / arr.length
    : null;

  function collectAvg() {
    // 从今天往回数 AVG_DAYS 个逻辑日
    const today = nowPoint().key;
    const keys = [];
    for (let i = 0; i < AVG_DAYS; i++) keys.push(shiftKey(today, -i));

    const wake = [], sleep = [], sdur = [], wdur = [];
    keys.forEach(k => {
      const r = dayOf(k);
      if (r && r.wake != null) wake.push(r.wake);
      if (r && r.sleep != null) sleep.push(r.sleep);
      const s = sleepDur(k); if (s != null) sdur.push(s);
      const w = workDur(k);  if (w != null) wdur.push(w);
    });
    return {
      wake: avg(wake), sleep: avg(sleep),
      sdur: avg(sdur), wdur: avg(wdur),
      n: { wake: wake.length, sleep: sleep.length, sdur: sdur.length, wdur: wdur.length }
    };
  }

  function renderStats() {
    const a = collectAvg();
    const cells = [
      { v: a.wake  != null ? fmt(Math.round(a.wake))  : null, cap: '平均起床' },
      { v: a.sleep != null ? fmt(Math.round(a.sleep)) : null, cap: '平均入睡' },
      { v: a.sdur  != null ? fmtDur(a.sdur)           : null, cap: '平均睡眠' },
      { v: a.wdur  != null ? fmtDur(a.wdur)           : null, cap: '平均在岗' }
    ];

    document.getElementById('stats').innerHTML = cells.map(c => `
      <div class="stat">
        <div class="s-num${c.v ? '' : ' dim'}">${c.v || '--:--'}</div>
        <div class="s-cap">${c.cap}</div>
      </div>`).join('');

    // 一句话把四个数串起来，比让用户自己看数舒服
    const parts = [];
    if (a.sdur != null) {
      const tag = a.sdur >= 480 ? '睡得足' : a.sdur >= 420 ? '基本够' : '偏少';
      parts.push(`平均睡 <b>${fmtDurPlain(a.sdur)}</b>，${tag}`);
    }
    if (a.wdur != null) parts.push(`在岗 <b>${fmtDurPlain(a.wdur)}</b>`);
    if (a.sleep != null && a.wake != null) {
      parts.push(`作息大致 <b>${fmt(Math.round(a.sleep))}</b> 睡 <b>${fmt(Math.round(a.wake))}</b> 起`);
    }
    document.getElementById('summary').innerHTML = parts.length
      ? `近 ${AVG_DAYS} 天${parts.join('，')}。`
      : '记满一天四项，这里就会出现平均值。';
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
        editKey = (editKey === k) ? null : k;
        renderAll();
        if (editKey) {
          document.getElementById('editor')
            .scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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

  function renderAll() {
    renderPunch();
    renderEditor();
    renderStats();
    renderChart();
    renderLog();
  }

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
