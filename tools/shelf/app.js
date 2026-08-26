/* ============================================================
   收藏夹 —— 把观影 / 读书 / 听播客这些事记在一处，
   既能从某部片子查到「我什么时候看的、当时怎么评价」，
   也能从某一天翻回「这天我都看了什么」。
   ------------------------------------------------------------
   数据结构（存在 localStorage 的 workbench.shelf）：
   {
     cats:  ['电影','电视剧','书籍', ...自定义],
     items: [{ id, title, cat, dates:['YYYY-MM-DD', ...], status,
                stars:0-5, note, link, at }]
   }

   两个设计取舍：

   1. 时间用「打卡日期数组」而不是单个日期
      电影一天看完就是一个日期；剧和书要跨好些天，而且是断续的
      （追两集停一周再追）。所以跟藏书馆一样每条自己有日历，
      点一天就代表那天看了。单日期是数组长度为 1 的特例，
      不需要两套逻辑，日历视图也只认这一个数组。

   2. 不做封面
      封面要么手动找图上传，要么走豆瓣防盗链抓图，两条路都费事，
      base64 还占满 localStorage。改成藏书馆那种紧凑目录：
      一条压到一行文字的高度，一屏扫十几条，比封面墙更好找东西。
      想看剧照点豆瓣链接过去就行。
   ============================================================ */

const store = new Store('shelf');

const DEFAULT_CATS = ['电影', '电视剧', '书籍', '播客'];
const STATUSES = ['想看', '在看', '看完'];

/* ---------- 小工具 ---------- */

const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s);

/** 把 'YYYY-MM-DD' 解析成本地时间的 Date（不加 T00:00:00 会被当 UTC，差一天） */
const parseDate = s => new Date(s + 'T00:00:00');

const fmtDate = s => s.slice(5).replace('-', '/');

/** 起止日期之间的每一天，含两端。用来把「观看范围」摊成打卡数组 */
function dateRange(from, to) {
  if (!isDate(from) || !isDate(to)) return [];
  let a = from, b = to;
  if (a > b) { const t = a; a = b; b = t; }

  const out = [];
  const cur = parseDate(a);
  const end = parseDate(b);
  // 跨度过大多半是手滑输错年份，兜一个上限免得卡死
  while (cur <= end && out.length < 2000) {
    out.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/* ---------- 数据读写 ---------- */

/**
 * 统一收敛成合法结构，顺带做老数据迁移：
 *   - date 单日期 → dates 数组
 *   - cover 封面（含 base64）直接丢掉，不再占空间
 * 导入的备份也走这里，结构不对不会把页面搞崩。
 */
function normalize(raw) {
  const d = (raw && typeof raw === 'object') ? raw : {};
  const cats = Array.isArray(d.cats) && d.cats.length ? d.cats.slice() : DEFAULT_CATS.slice();

  const items = (Array.isArray(d.items) ? d.items : []).map(it => {
    // 新结构用 dates，老结构只有 date
    let dates = Array.isArray(it.dates) ? it.dates.filter(isDate) : [];
    if (!dates.length && isDate(it.date)) dates = [it.date];
    dates = Array.from(new Set(dates)).sort();

    return {
      id:     it.id || uid(),
      title:  String(it.title || '').trim(),
      cat:    cats.includes(it.cat) ? it.cat : cats[0],
      dates,
      status: STATUSES.includes(it.status) ? it.status : '看完',
      stars:  Math.max(0, Math.min(5, Number(it.stars) || 0)),
      note:   String(it.note || ''),
      link:   String(it.link || ''),
      at:     it.at || Date.now()
    };
  }).filter(it => it.title);

  return { cats, items };
}

let db = normalize(store.load(null));

/** 老数据里的封面 base64 不迁移，第一次打开就写回一份干净的，把空间放出来 */
(function dropLegacyCovers() {
  const raw = store.load(null);
  if (raw && Array.isArray(raw.items) && raw.items.some(i => i && i.cover)) {
    store.save(db);
  }
})();

const persist = () => store.save(db);

/** 一条记录的时间跨度：单日显示一个日期，多日显示首尾 */
function spanText(it) {
  if (!it.dates.length) return '未记日期';
  if (it.dates.length === 1) return fmtDate(it.dates[0]);
  const a = it.dates[0], b = it.dates[it.dates.length - 1];
  return `${fmtDate(a)}–${fmtDate(b)}`;
}

/* ============================================================
   视图切换
   ============================================================ */

function showView(v) {
  ['list', 'cal', 'item'].forEach(x => $('v-' + x).classList.toggle('on', x === v));
  // 详情是从清单钻进去的，不属于顶层 tab，进去时把 tab 条收起来
  $('tabs').classList.toggle('hide', v === 'item');
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('on', t.dataset.view === v);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    const v = t.dataset.view;
    showView(v);
    if (v === 'cal') renderCal();
    else renderList();
  };
});

$('item-back').onclick = () => { openItemId = null; showView('list'); renderAll(); };

/* ============================================================
   清单视图
   ============================================================ */

let filterCat = '全部';
let keyword = '';

function renderStats() {
  const t = today();
  const box = $('stats');
  const todayCnt = db.items.filter(i => i.dates.includes(t)).length;
  const watching = db.items.filter(i => i.status === '在看').length;
  const done     = db.items.filter(i => i.status === '看完').length;

  const cells = [
    ['今天', todayCnt, true],
    ['在看', watching, false],
    ['看完', done, false],
    ['共计', db.items.length, false]
  ];

  box.innerHTML = '';
  cells.forEach(([label, n, hot]) => {
    const d = document.createElement('div');
    d.className = 'stat' + (hot ? ' today' : '');
    const b = document.createElement('b');
    b.textContent = n;
    const s = document.createElement('span');
    s.textContent = label;
    d.append(b, s);
    box.appendChild(d);
  });
}

function renderFilter() {
  const box = $('filter');
  box.innerHTML = '';
  ['全部'].concat(db.cats).forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (c === filterCat ? ' on' : '');
    const n = c === '全部' ? db.items.length : db.items.filter(i => i.cat === c).length;
    b.textContent = n ? `${c} ${n}` : c;
    b.onclick = () => { filterCat = c; renderFilter(); renderList(); };
    box.appendChild(b);
  });
}

function matches(it) {
  if (filterCat !== '全部' && it.cat !== filterCat) return false;
  if (!keyword) return true;
  const k = keyword.toLowerCase();
  return (it.title + ' ' + it.note).toLowerCase().includes(k);
}

function renderList() {
  const listEl = $('list');
  listEl.innerHTML = '';

  const rows = db.items.filter(matches).sort((a, b) => {
    // 在看的排最前 —— 这些是手上正在追的，最常要打卡
    const rank = s => s === '在看' ? 0 : s === '想看' ? 1 : 2;
    const last = i => i.dates.length ? i.dates[i.dates.length - 1] : '';
    return rank(a.status) - rank(b.status)
        || last(b).localeCompare(last(a))
        || b.at - a.at;
  });

  $('empty').style.display = rows.length ? 'none' : 'block';
  $('empty').innerHTML = db.items.length
    ? '没有符合条件的记录'
    : '还没有记录<br>点上面「记一条」开始';

  rows.forEach(it => listEl.appendChild(itemRow(it)));
  $('count').textContent = rows.length ? `${pad(rows.length)} 条` : '';
}

/** 紧凑一行：状态点 · 标题 · 分类/日期/评分 · 豆瓣跳转 */
function itemRow(it) {
  const li = document.createElement('li');

  const dot = document.createElement('span');
  dot.className = 'it-dot' + (it.status === '在看' ? ' watching' : it.status === '看完' ? ' done' : '');
  dot.title = it.status;

  // 整块可点，进详情
  const main = document.createElement('button');
  main.type = 'button';
  main.className = 'it-main';
  main.onclick = () => openItem(it.id);

  const t = document.createElement('span');
  t.className = 'it-title';
  t.textContent = it.title;

  const meta = document.createElement('span');
  meta.className = 'it-meta';
  const bits = [it.cat, spanText(it)];
  if (it.dates.length > 1) bits.push(it.dates.length + ' 天');
  bits.forEach((b, i) => {
    if (i) {
      const s = document.createElement('span');
      s.className = 'dot'; s.textContent = '·';
      meta.appendChild(s);
    }
    meta.append(document.createTextNode(b));
  });
  if (it.stars) {
    const s = document.createElement('span');
    s.className = 'dot'; s.textContent = '·';
    meta.appendChild(s);
    const st = document.createElement('span');
    st.className = 'stars';
    st.textContent = '●'.repeat(it.stars);
    meta.appendChild(st);
  }

  main.append(t, meta);

  // 行尾只放豆瓣入口。打卡挪到详情页的日历里 ——
  // 列表是用来扫读和找东西的，不该在这儿误触改数据。
  const tail = document.createElement('div');
  tail.className = 'it-tail';
  tail.appendChild(doubanLink(it));

  li.append(dot, main, tail);
  return li;
}

/**
 * 豆瓣跳转链接。存过条目链接就直接去那一页，
 * 没存过就退回按标题搜 —— 这样每条都有入口，不用先去补链接。
 */
function doubanLink(it) {
  const a = document.createElement('a');
  a.className = 'db-tag';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = '豆瓣';
  a.onclick = e => e.stopPropagation();   // 别连带触发整行进详情

  if (it.link) {
    a.href = it.link;
    a.title = '在豆瓣打开这一条';
  } else {
    const kind = kindOf(it.cat);
    a.href = `https://${kind}.douban.com/subject_search?search_text=${encodeURIComponent(it.title)}`;
    a.title = '这条还没存豆瓣链接，先去豆瓣搜一下';
    a.classList.add('guess');
  }
  return a;
}

/* ============================================================
   打卡
   ------------------------------------------------------------
   一天可以给多条各打一次，互不干扰。同一条同一天只算一次，
   再点是取消（记错了能撤）。想看的一打卡就自动变「在看」，
   省一次手动改状态。
   ============================================================ */

function toggleCheckin(id, date) {
  const it = db.items.find(i => i.id === id);
  if (!it) return;

  const set = new Set(it.dates);
  if (set.has(date)) {
    set.delete(date);
  } else {
    set.add(date);
    if (it.status === '想看') it.status = '在看';
  }
  it.dates = Array.from(set).sort();

  if (!persist()) return;
  renderAll();
}

/* ============================================================
   条目详情：从内容定位到「什么时候看的 + 当时的评价」
   ============================================================ */

let openItemId = null;
let dCalY, dCalM;

function openItem(id) {
  const it = db.items.find(i => i.id === id);
  if (!it) return;
  openItemId = id;

  // 日历默认落在有记录的月份：有打卡就停在最近一次，否则本月
  const last = it.dates[it.dates.length - 1];
  const base = last ? parseDate(last) : new Date();
  dCalY = base.getFullYear();
  dCalM = base.getMonth();

  showView('item');
  renderItem();
}

function segHead(en, cn, extra) {
  const d = document.createElement('div');
  d.className = 'seg';
  const l = document.createElement('span');
  l.className = 'overline sec';
  l.textContent = en;
  const r = document.createElement('span');
  r.className = 'cal-foot';
  r.style.margin = '0';
  r.textContent = extra || '';
  d.append(l, r);
  return d;
}

function renderItem() {
  const it = db.items.find(i => i.id === openItemId);
  if (!it) { showView('list'); return; }

  const box = $('detail');
  box.innerHTML = '';

  const h = document.createElement('h2');
  h.textContent = it.title;
  box.appendChild(h);

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.textContent = [it.cat, it.status, it.stars ? '●'.repeat(it.stars) : ''].filter(Boolean).join('  ·  ');
  box.appendChild(sub);

  /* ---- 基本信息 ---- */
  const dl = document.createElement('dl');
  dl.className = 'info';

  const add = (k, node) => {
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd');
    if (typeof node === 'string') dd.textContent = node; else dd.appendChild(node);
    dl.append(dt, dd);
  };

  add('时间', it.dates.length
    ? (it.dates.length === 1 ? it.dates[0] : `${it.dates[0]} — ${it.dates[it.dates.length - 1]}`)
    : '还没记');
  if (it.dates.length > 1) add('天数', it.dates.length + ' 天');

  // 没存链接也给个搜索入口，省得为了跳转先回去编辑
  const dbA = document.createElement('a');
  dbA.target = '_blank';
  dbA.rel = 'noopener noreferrer';
  dbA.style.color = 'var(--orange)';
  if (it.link) {
    dbA.href = it.link;
    dbA.textContent = '在豆瓣打开 ↗';
  } else {
    dbA.href = `https://${kindOf(it.cat)}.douban.com/subject_search?search_text=${encodeURIComponent(it.title)}`;
    dbA.textContent = '去豆瓣搜这个 ↗';
  }
  add('豆瓣', dbA);

  box.appendChild(dl);

  /* ---- 评价 ---- */
  box.appendChild(segHead('Review', '评价', ''));
  if (it.note) {
    const n = document.createElement('div');
    n.className = 'note-body';
    n.textContent = it.note;
    box.appendChild(n);
  } else {
    const n = document.createElement('p');
    n.className = 'note-none';
    n.textContent = '还没写评价。点下面「编辑」补一句。';
    box.appendChild(n);
  }

  /* ---- 打卡日历 ---- */
  box.appendChild(segHead('Calendar', '观看打卡',
    it.dates.length ? (it.dates.length + ' 天') : ''));
  box.appendChild(buildItemCal(it));

  /* ---- 操作 ---- */
  const acts = document.createElement('div');
  acts.className = 'row';
  acts.style.marginTop = '30px';

  const ed = document.createElement('button');
  ed.className = 'btn'; ed.type = 'button'; ed.textContent = '编辑';
  ed.onclick = () => { showView('list'); openForm(it.id); };

  const del = document.createElement('button');
  del.className = 'btn-ghost'; del.type = 'button'; del.textContent = '删除';
  del.onclick = () => {
    if (!confirm(`删除「${it.title}」？`)) return;
    db.items = db.items.filter(x => x.id !== it.id);
    if (!persist()) return;
    openItemId = null;
    showView('list');
    renderAll();
  };

  acts.append(ed, del);
  box.appendChild(acts);
}

/**
 * 单条目的打卡日历。点任意一天切换那天的状态 ——
 * 不只是今天，补记前几天看过的也行（经常隔几天才想起来记）。
 * 未来的日期点不了，避免误触。
 */
function buildItemCal(it) {
  const wrap = document.createElement('div');
  const hits = new Set(it.dates);
  const t = today();

  /* 月份导航 */
  const top = document.createElement('div');
  top.className = 'cal-top';
  const title = document.createElement('div');
  title.className = 'cal-title';
  title.textContent = `${dCalY} / ${pad(dCalM + 1)}`;
  const nav = document.createElement('div');
  nav.className = 'cal-nav';

  const mk = (txt, fn) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = txt; b.onclick = fn;
    return b;
  };
  nav.append(
    mk('‹', () => { dCalM--; if (dCalM < 0) { dCalM = 11; dCalY--; } renderItem(); }),
    mk('›', () => { dCalM++; if (dCalM > 11) { dCalM = 0; dCalY++; } renderItem(); })
  );
  top.append(title, nav);
  wrap.appendChild(top);

  const week = document.createElement('div');
  week.className = 'cal-week';
  ['一','二','三','四','五','六','日'].forEach(d => {
    const s = document.createElement('span'); s.textContent = d; week.appendChild(s);
  });
  wrap.appendChild(week);

  const grid = document.createElement('div');
  grid.className = 'ccal';

  const lead = (new Date(dCalY, dCalM, 1).getDay() + 6) % 7;   // 周一为一周起点
  const days = new Date(dCalY, dCalM + 1, 0).getDate();

  for (let i = 0; i < lead; i++) {
    const c = document.createElement('div');
    c.className = 'cell pad';
    grid.appendChild(c);
  }

  for (let d = 1; d <= days; d++) {
    const key = `${dCalY}-${pad(dCalM + 1)}-${pad(d)}`;
    const isFuture = key > t;

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell'
      + (hits.has(key) ? ' hit' : '')
      + (key === t ? ' today' : '')
      + (isFuture ? ' future' : '');
    cell.textContent = d;
    cell.disabled = isFuture;
    cell.title = isFuture ? ''
      : (hits.has(key) ? key + ' 已打卡，点击取消' : '记一次 ' + key + ' 看过');
    if (!isFuture) cell.onclick = () => toggleCheckin(it.id, key);

    grid.appendChild(cell);
  }
  wrap.appendChild(grid);

  /* 脚注 + 补一段范围 */
  const prefix = `${dCalY}-${pad(dCalM + 1)}`;
  const inMonth = it.dates.filter(x => x.startsWith(prefix)).length;
  const last = it.dates[it.dates.length - 1];

  const foot = document.createElement('div');
  foot.className = 'cal-foot';
  foot.textContent = inMonth
    ? `本月看了 ${inMonth} 天` + (last ? `，最近一次 ${last}` : '')
    : '这个月还没打卡。点任意一天可以补记';
  wrap.appendChild(foot);

  // 追剧时一天一天点太累，给个区间批量补
  const tools = document.createElement('div');
  tools.className = 'cal-tools';

  const rangeBtn = document.createElement('button');
  rangeBtn.className = 'btn-ghost btn-sm';
  rangeBtn.type = 'button';
  rangeBtn.textContent = '补一段';
  rangeBtn.onclick = () => {
    const from = (prompt('从哪天开始？（YYYY-MM-DD）', last || t) || '').trim();
    if (!from) return;
    const to = (prompt('到哪天结束？（YYYY-MM-DD）', t) || '').trim();
    if (!to) return;
    if (!isDate(from) || !isDate(to)) { alert('日期格式得是 2026-08-26 这样'); return; }

    const span = dateRange(from, to).filter(d => d <= t);
    if (!span.length) { alert('这个区间里没有可记的日子（未来的日期记不了）'); return; }

    const set = new Set(it.dates);
    const before = set.size;
    span.forEach(d => set.add(d));
    it.dates = Array.from(set).sort();
    if (it.status === '想看') it.status = '在看';
    if (!persist()) return;
    alert(`补了 ${set.size - before} 天`);
    renderAll();
    renderItem();
  };

  const clrBtn = document.createElement('button');
  clrBtn.className = 'btn-ghost btn-sm';
  clrBtn.type = 'button';
  clrBtn.textContent = '清空打卡';
  clrBtn.onclick = () => {
    if (!it.dates.length) return;
    if (!confirm(`清掉「${it.title}」的全部 ${it.dates.length} 天打卡？`)) return;
    it.dates = [];
    if (!persist()) return;
    renderAll();
    renderItem();
  };

  tools.append(rangeBtn, clrBtn);
  wrap.appendChild(tools);

  return wrap;
}

/* ============================================================
   表单：新增 / 编辑共用
   ------------------------------------------------------------
   日期栏是两个：只填前一个就是「一天看完」（电影），
   两个都填就是「这段时间在看」（剧、书），保存时摊成打卡数组。
   编辑已有记录时，日期栏默认显示首尾，改了就按新范围重算 ——
   但如果范围没动，原来一天天点出来的断续打卡会原样保留，
   不会被拉平成连续的一整段。
   ============================================================ */

let editingId = null;
let draft = blankDraft();

function blankDraft() {
  return { cat: db.cats[0], status: '看完', stars: 0, link: '', dates: [] };
}

function renderCatPicker() {
  const box = $('f-cats');
  box.innerHTML = '';
  db.cats.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (c === draft.cat ? ' on' : '');
    b.textContent = c;
    b.onclick = () => { draft.cat = c; renderCatPicker(); };
    box.appendChild(b);
  });

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'chip ghost';
  add.textContent = '＋ 新分类';
  add.onclick = () => {
    const name = (prompt('新分类叫什么？比如 展览、演出、游戏') || '').trim();
    if (!name) return;
    if (db.cats.includes(name)) { draft.cat = name; renderCatPicker(); return; }
    db.cats.push(name);
    draft.cat = name;
    persist(); renderCatPicker(); renderFilter();
  };
  box.appendChild(add);
}

function renderStatusPicker() {
  const box = $('f-status');
  box.innerHTML = '';
  STATUSES.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (s === draft.status ? ' on' : '');
    b.textContent = s;
    b.onclick = () => { draft.status = s; renderStatusPicker(); };
    box.appendChild(b);
  });
}

function renderStars() {
  $('f-stars').querySelectorAll('button[data-v]').forEach(b => {
    b.classList.toggle('lit', Number(b.dataset.v) <= draft.stars);
  });
}

/** 提示这次会记成几天，避免用户填完范围不知道会发生什么 */
function renderDatesNote() {
  const a = $('f-date').value;
  const b = $('f-date2').value;
  const el = $('f-dates-note');
  el.className = 'hint-note';

  if (!a && !b) { el.textContent = '不填就记今天。'; return; }
  if (a && b) {
    const n = dateRange(a, b).length;
    el.textContent = n
      ? `会在日历上标 ${n} 天。之后还能在详情里逐天增减。`
      : '日期看着不太对，检查一下。';
    return;
  }
  el.textContent = '只填一天 = 一天看完。跨好几天的剧或书可以填「到」，或者保存后在详情里逐天打卡。';
}

function syncForm() {
  $('f-title').value = draft.title || '';
  $('f-note').value  = draft.note || '';
  $('f-link').value  = draft.link || '';

  // 编辑时把已有打卡的首尾放进日期栏；单日就只填第一个
  const ds = draft.dates || [];
  $('f-date').value  = ds.length ? ds[0] : today();
  $('f-date2').value = ds.length > 1 ? ds[ds.length - 1] : '';

  renderCatPicker();
  renderStatusPicker();
  renderStars();
  renderDatesNote();
  $('sugg').style.display = 'none';
  $('sugg').innerHTML = '';
}

function openForm(id) {
  editingId = id || null;
  draft = id
    ? Object.assign({}, db.items.find(i => i.id === id))
    : blankDraft();
  syncForm();
  $('form').classList.add('on');
  $('add-open').textContent = id ? '（正在编辑）' : '＋ 记一条';
  $('form').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeForm() {
  $('form').classList.remove('on');
  $('add-open').textContent = '＋ 记一条';
  editingId = null;
}

$('add-open').onclick = () => openForm(null);
$('f-cancel').onclick = closeForm;
$('f-date').oninput  = renderDatesNote;
$('f-date2').oninput = renderDatesNote;

$('f-stars').querySelectorAll('button[data-v]').forEach(b => {
  b.onclick = () => {
    const v = Number(b.dataset.v);
    draft.stars = (draft.stars === v) ? v - 1 : v;   // 点当前分再点一次少一颗
    renderStars();
  };
});
$('f-star-clr').onclick = () => { draft.stars = 0; renderStars(); };
$('f-link-clr').onclick = () => { $('f-link').value = ''; draft.link = ''; };

$('f-save').onclick = () => {
  const title = $('f-title').value.trim();
  if (!title) { alert('至少写个标题'); $('f-title').focus(); return; }

  const a = $('f-date').value;
  const b = $('f-date2').value;
  const old = editingId ? db.items.find(i => i.id === editingId) : null;

  let dates;
  if (a && b) {
    // 范围跟原来一致就别动 —— 中间断续的打卡是手点出来的，不能被拉平
    const od = old ? old.dates : [];
    const sameSpan = od.length > 1 && od[0] === a && od[od.length - 1] === b;
    dates = sameSpan ? od.slice() : dateRange(a, b);
  } else if (a) {
    // 单日：原来有多天打卡时只保证这天在里面，不清掉其它
    const od = old ? old.dates : [];
    if (od.length > 1) {
      dates = Array.from(new Set(od.concat([a]))).sort();
    } else {
      dates = [a];
    }
  } else {
    dates = [today()];
  }

  const link = $('f-link').value.trim();

  const rec = {
    id:     editingId || uid(),
    title,
    cat:    draft.cat,
    dates,
    status: draft.status,
    stars:  draft.stars,
    note:   $('f-note').value.trim(),
    link,
    at:     old ? old.at : Date.now()
  };

  if (editingId) {
    db.items = db.items.map(i => i.id === editingId ? rec : i);
  } else {
    db.items.unshift(rec);
  }

  if (!persist()) return;
  closeForm();
  renderAll();
};

/* ============================================================
   豆瓣：拿链接，不拿图
   ------------------------------------------------------------
   suggest 接口不返回 CORS 头也不支持 JSONP，只能借公共代理。
   这些是免费服务、随时可能挂，排成一列逐个试，全挂就退回手动
   （点「去豆瓣搜」自己复制地址），不影响记录本身。

   以前还要额外抓封面图，豆瓣防盗链拦得厉害，成功率很低；
   现在只要一个链接，代理拿到 JSON 就够了，链路短了一半。
   ============================================================ */

const PROXIES = [
  u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
  u => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u),
  u => 'https://corsproxy.io/?url=' + encodeURIComponent(u),
  u => 'https://proxy.cors.sh/' + u
];

/** 书籍走 book 库，其余走 movie 库 */
const kindOf = cat => cat === '书籍' ? 'book' : 'movie';

function doubanUrl(q, kind) {
  const host = kind === 'book' ? 'book.douban.com' : 'movie.douban.com';
  return `https://${host}/j/subject_suggest?q=${encodeURIComponent(q)}`;
}

// 代理卡住时不能一直转圈，给每次请求一个上限。
// AbortSignal.timeout 在旧版 Chrome 上没有，退回手动 AbortController。
function timeoutSignal(ms) {
  if (AbortSignal.timeout) return AbortSignal.timeout(ms);
  const ac = new AbortController();
  setTimeout(() => ac.abort(), ms);
  return ac.signal;
}

async function fetchJSON(url) {
  for (const wrap of PROXIES) {
    try {
      const res = await fetch(wrap(url), { signal: timeoutSignal(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) return data;
    } catch { /* 换下一个代理 */ }
  }
  return null;
}

$('f-fetch').onclick = async () => {
  const q = $('f-title').value.trim();
  if (!q) { alert('先写标题再搜'); $('f-title').focus(); return; }

  const btn = $('f-fetch');
  btn.disabled = true;
  btn.textContent = '搜索中';

  const raw = await fetchJSON(doubanUrl(q, kindOf(draft.cat)));

  btn.disabled = false;
  btn.textContent = '找豆瓣';

  const box = $('sugg');
  box.style.display = 'block';

  if (!raw) {
    box.innerHTML =
      '<p class="hint-note">自动搜索没通（豆瓣不对网页开放，得借第三方中转，' +
      '这些免费服务时好时坏）。点下面「去豆瓣搜」，找到条目后把地址栏的链接' +
      '复制粘贴到「豆瓣链接」里，效果一样。不填链接也完全能用。</p>';
    return;
  }

  const list = raw.slice(0, 8).map(r => ({
    title: r.title || '',
    sub: [r.year, r.author_name, r.episode ? r.episode + ' 集' : ''].filter(Boolean).join(' · '),
    link: (r.url || '').split('?')[0]
  })).filter(r => r.title);

  if (!list.length) {
    box.innerHTML = '<p class="hint-note">没搜到，换个更完整的名字试试。</p>';
    return;
  }

  box.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'sugg-list';

  list.forEach(r => {
    const li = document.createElement('li');
    const t = document.createElement('div');
    t.className = 'sugg-t'; t.textContent = r.title;
    const s = document.createElement('div');
    s.className = 'sugg-s';
    s.textContent = [r.sub, r.link ? '有链接' : '无链接'].filter(Boolean).join('  ·  ');
    li.append(t, s);

    li.onclick = () => {
      $('f-title').value = r.title;
      draft.title = r.title;
      if (r.link) { $('f-link').value = r.link; draft.link = r.link; }
      box.style.display = 'none';
    };

    ul.appendChild(li);
  });

  box.appendChild(ul);
  const note = document.createElement('p');
  note.className = 'hint-note';
  note.textContent = '点一条，名字和豆瓣链接一起填进去。';
  box.appendChild(note);
};

$('f-douban').onclick = () => {
  const q = $('f-title').value.trim();
  const kind = kindOf(draft.cat);
  const url = q
    ? `https://${kind}.douban.com/subject_search?search_text=${encodeURIComponent(q)}`
    : `https://${kind}.douban.com/`;
  window.open(url, '_blank', 'noopener');
};

/* ---------- 搜索 ---------- */

$('search').oninput = () => { keyword = $('search').value.trim(); renderList(); };

/* ---------- 分类管理 ---------- */

$('mng-cat').onclick = () => {
  const name = (prompt(
    '现有分类：' + db.cats.join('、') +
    '\n\n输入新名字添加；输入已有名字则删除（该分类下的记录会移到第一个分类）。'
  ) || '').trim();
  if (!name) return;

  if (db.cats.includes(name)) {
    if (db.cats.length === 1) { alert('至少留一个分类'); return; }
    const n = db.items.filter(i => i.cat === name).length;
    if (!confirm(`删除分类「${name}」？其中 ${n} 条记录会移到「${db.cats.find(c => c !== name)}」`)) return;
    db.cats = db.cats.filter(c => c !== name);
    db.items.forEach(i => { if (i.cat === name) i.cat = db.cats[0]; });
    if (filterCat === name) filterCat = '全部';
  } else {
    db.cats.push(name);
  }

  persist(); renderAll();
};

/* ============================================================
   月历视图：从某一天翻回那天都看了什么
   ------------------------------------------------------------
   一条记录可能占好几天，所以同一条会出现在它每个打卡日里 ——
   追剧那一周每天都能看到它，这正是想要的效果。
   ============================================================ */

let curY, curM, selDate = null;
(() => { const d = new Date(); curY = d.getFullYear(); curM = d.getMonth(); })();

/** 日期 → 当天看过的记录，日历和当日面板都查这张表 */
function indexByDate() {
  const map = {};
  db.items.forEach(it => {
    it.dates.forEach(d => { (map[d] = map[d] || []).push(it); });
  });
  return map;
}

function renderCal() {
  $('cal-title').textContent = `${curY} 年 ${curM + 1} 月`;

  const grid = $('grid');
  grid.innerHTML = '';

  const byDate = indexByDate();
  const lead = (new Date(curY, curM, 1).getDay() + 6) % 7;   // 周一为一周起点
  const days = new Date(curY, curM + 1, 0).getDate();

  for (let i = 0; i < lead; i++) {
    const c = document.createElement('div');
    c.className = 'cell pad';
    grid.appendChild(c);
  }

  for (let d = 1; d <= days; d++) {
    const key = `${curY}-${pad(curM + 1)}-${pad(d)}`;
    const list = byDate[key] || [];

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell'
      + (key === today() ? ' today' : '')
      + (key === selDate ? ' sel' : '')
      + (list.length ? '' : ' empty0');

    const num = document.createElement('span');
    num.className = 'dnum';
    num.textContent = d;
    cell.appendChild(num);

    // 宽屏显示标题，窄屏显示圆点（CSS 控制哪个可见）
    list.slice(0, 2).forEach(it => {
      const m = document.createElement('div');
      m.className = 'mini';
      m.textContent = it.title;
      cell.appendChild(m);
    });
    if (list.length > 2) {
      const m = document.createElement('div');
      m.className = 'mini';
      m.style.color = 'var(--text-sec)';
      m.textContent = `+${list.length - 2}`;
      cell.appendChild(m);
    }

    if (list.length) {
      const dots = document.createElement('div');
      dots.className = 'dots';
      list.slice(0, 6).forEach(() => dots.appendChild(document.createElement('i')));
      cell.appendChild(dots);
    }

    cell.onclick = () => {
      selDate = (selDate === key) ? null : key;
      renderCal();
    };

    grid.appendChild(cell);
  }

  renderDayPanel(byDate);
}

function renderDayPanel(byDate) {
  const box = $('day-panel');
  box.innerHTML = '';

  // 没选具体某天时，展示当月出现过的全部记录（去重）
  const isDay = !!selDate;
  const prefix = `${curY}-${pad(curM + 1)}`;

  let rows;
  if (isDay) {
    rows = byDate[selDate] || [];
  } else {
    const seen = new Set();
    rows = [];
    Object.keys(byDate).filter(d => d.startsWith(prefix)).sort().reverse()
      .forEach(d => byDate[d].forEach(it => {
        if (seen.has(it.id)) return;
        seen.add(it.id);
        rows.push(it);
      }));
  }

  const label = document.createElement('span');
  label.className = 'overline sec';
  label.textContent = isDay
    ? selDate.replace(/-/g, ' / ') + `  ·  ${rows.length} 条`
    : `${curM + 1} 月 · ${rows.length} 条`;
  box.appendChild(label);

  if (!rows.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.style.padding = '38px 26px';
    e.innerHTML = isDay ? '这天没有记录' : '这个月还没有记录';
    box.appendChild(e);
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'items';
  rows.forEach(it => ul.appendChild(itemRow(it)));
  box.appendChild(ul);
}

$('cal-prev').onclick = () => {
  curM--; if (curM < 0) { curM = 11; curY--; }
  selDate = null; renderCal();
};
$('cal-next').onclick = () => {
  curM++; if (curM > 11) { curM = 0; curY++; }
  selDate = null; renderCal();
};
$('cal-today').onclick = () => {
  const d = new Date();
  curY = d.getFullYear(); curM = d.getMonth(); selDate = today();
  renderCal();
};

/* ============================================================
   备份
   ============================================================ */

$('export').onclick = () => store.exportFile();

$('import').onclick = () => {
  store.importFile(data => {
    const incoming = normalize(data);   // 老备份里的 date / cover 在这里一并迁移
    if (!incoming.items.length) { alert('备份里没有可导入的记录'); return; }

    let next;
    if (db.items.length) {
      const merge = confirm(
        `备份里有 ${incoming.items.length} 条，当前有 ${db.items.length} 条。\n\n` +
        '确定 = 合并（保留现有，去重后追加）\n取消 = 用备份完全替换'
      );
      if (merge) {
        // 同名同分类算同一条，把两边的打卡日期并起来
        const key = i => i.title + '|' + i.cat;
        const mine = new Map(db.items.map(i => [key(i), i]));
        let added = 0, merged = 0;

        incoming.items.forEach(i => {
          const hit = mine.get(key(i));
          if (hit) {
            const before = hit.dates.length;
            hit.dates = Array.from(new Set(hit.dates.concat(i.dates))).sort();
            if (!hit.note && i.note) hit.note = i.note;
            if (!hit.link && i.link) hit.link = i.link;
            if (!hit.stars && i.stars) hit.stars = i.stars;
            if (hit.dates.length !== before) merged++;
          } else {
            db.items.push(i);
            mine.set(key(i), i);
            added++;
          }
        });

        const cats = db.cats.slice();
        incoming.cats.forEach(c => { if (!cats.includes(c)) cats.push(c); });
        next = { cats, items: db.items };
        alert(`已合并：新增 ${added} 条，${merged} 条补了打卡日期`);
      } else {
        next = incoming;
        alert(`已替换为备份内容，共 ${incoming.items.length} 条`);
      }
    } else {
      next = incoming;
      alert(`已恢复 ${incoming.items.length} 条`);
    }

    db = next;
    persist(); renderAll();
  });
};

/* ---------- 启动 ---------- */

function renderAll() {
  renderStats();
  renderFilter();
  renderList();
  if ($('v-cal').classList.contains('on')) renderCal();
  if ($('v-item').classList.contains('on') && openItemId) renderItem();
}

renderAll();
