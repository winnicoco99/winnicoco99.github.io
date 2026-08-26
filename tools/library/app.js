/* ============================================================
   藏书馆
   ------------------------------------------------------------
   解决的问题：家里买了什么书自己记不清，容易买重。
   所以「扫码 → 立刻告诉你重不重」是这个工具的第一优先级，
   其余功能（打卡、摘录、感想）都排在它后面。

   三件事的设计取舍：

   1. 阅读时间用「打卡」而不是起止日期
      —— 用户是乱着读的，一天可能翻好几本，一本书读几个月。
      所以每本书有自己的日历，点一天就代表那天读了，
      打卡记录本身就是轨迹，不需要另外记开始/结束。

   2. 存储用 IndexedDB（见 db.js 注释）
      —— localStorage 5MB 装不下长期累积的摘录。

   3. 完全不做封面
      —— 一是取不到：豆瓣图片是 referer 白名单（空 referer 返 418），
      浏览器不允许伪造 referer，图片代理也一样被拒。
      二是用户明确不要：预计录几百本，纯文字列表滚动扫读更快，
      一行只占 ~54px，一屏能看十几本。
   ============================================================ */

import { DB, uid } from './db.js';

const $ = id => document.getElementById(id);

const STATUSES = ['未看', '在看', '已看'];
const STATUS_CLASS = { '未看': '', '在看': 'reading', '已看': 'done' };

/* ---------- 日期 ---------- */

const pad = n => String(n).padStart(2, '0');

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ymd(y, m, d) {  // m 是 0-based
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

/* ============================================================
   豆瓣图书：JSONP 调用
   ------------------------------------------------------------
   这个接口不返回 CORS 头，但支持 callback 参数，所以走 JSONP
   就能在纯静态页面里直接用，不需要那些时好时坏的公共代理。
   （收藏夹当初走代理，实测经常整条链路挂掉）

   实测命中率约八成，冷门书、港台原版查不到，
   所以任何时候都能跳过查询直接手填。
   ============================================================ */

let jsonpSeq = 0;

function jsonp(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const cb = '__lib_cb_' + (++jsonpSeq);
    const s = document.createElement('script');

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('查询超时'));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      delete window[cb];
      s.remove();
    }

    window[cb] = data => { cleanup(); resolve(data); };
    s.onerror = () => { cleanup(); reject(new Error('网络请求失败')); };

    s.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb;
    document.head.appendChild(s);
  });
}

const DOUBAN_KEY = '0ac44ae016490db2204ce0a042db2916';

function lookupISBN(isbn) {
  return jsonp('https://api.douban.com/v2/book/isbn/'
    + encodeURIComponent(isbn) + '?apikey=' + DOUBAN_KEY);
}

function searchByTitle(q) {
  return jsonp('https://api.douban.com/v2/book/search?count=6&q='
    + encodeURIComponent(q) + '&apikey=' + DOUBAN_KEY);
}

/** 豆瓣返回的字段名跟我们的不一样，统一在这里转换，别让它渗进业务代码 */
function fromDouban(d) {
  return {
    isbn: String(d.isbn13 || d.isbn10 || '').trim(),
    title: String(d.title || '').trim(),
    subtitle: String(d.subtitle || '').trim(),
    author: (d.author || []).join('、'),
    translator: (d.translator || []).join('、'),
    publisher: String(d.publisher || '').trim(),
    pubdate: String(d.pubdate || '').trim(),
    pages: String(d.pages || '').replace(/[^0-9]/g, ''),
    summary: String(d.summary || '').trim()
  };
}

/** ISBN 只留数字和 X（10 位 ISBN 末位可能是 X） */
function cleanISBN(v) {
  return String(v || '').replace(/[^0-9Xx]/g, '').toUpperCase();
}

/* ============================================================
   状态
   ============================================================ */

let books = [];              // 全部书，内存里存一份，列表渲染快
let filterStatus = '全部';
let keyword = '';

let editingId = null;        // 有值 = 编辑已有书；null = 新增
let draft = blankDraft();

let openBookId = null;       // 详情页当前书
let calY, calM;              // 详情页日历显示的年月

function blankDraft() {
  return {
    isbn: '', title: '', subtitle: '', author: '', translator: '',
    publisher: '', pubdate: '', pages: '', summary: '',
    status: '未看', bought: today(), note: ''
  };
}

/* ============================================================
   视图切换
   ============================================================ */

function show(which) {
  $('v-list').style.display = which === 'list' ? 'block' : 'none';
  $('v-edit').classList.toggle('on', which === 'edit');
  $('v-book').classList.toggle('on', which === 'book');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ============================================================
   列表
   ============================================================ */

async function reload() {
  books = await DB.allBooks();
  renderStats();
  renderFilters();
  renderBooks();
  renderQuota();
}

function renderStats() {
  const t = today();
  const readToday = books.filter(b => (b.checkins || []).includes(t)).length;
  const reading = books.filter(b => b.status === '在看').length;
  const done = books.filter(b => b.status === '已看').length;

  const cells = [
    ['藏书', books.length, ''],
    ['在看', reading, ''],
    ['已看', done, ''],
    ['今天读了', readToday, 'today']
  ];

  $('stats').innerHTML = '';
  cells.forEach(([label, n, cls]) => {
    const d = document.createElement('div');
    d.className = 'stat' + (cls ? ' ' + cls : '');
    const b = document.createElement('b');
    b.textContent = n;
    const s = document.createElement('span');
    s.textContent = label;
    d.append(b, s);
    $('stats').appendChild(d);
  });
}

function renderFilters() {
  const box = $('filters');
  box.innerHTML = '';
  ['全部'].concat(STATUSES).forEach(s => {
    const n = s === '全部' ? books.length : books.filter(b => b.status === s).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (s === filterStatus ? ' on' : '');
    b.textContent = n ? `${s} ${n}` : s;
    b.onclick = () => { filterStatus = s; renderFilters(); renderBooks(); };
    box.appendChild(b);
  });
}

function matches(b) {
  if (filterStatus !== '全部' && b.status !== filterStatus) return false;
  if (!keyword) return true;
  const k = keyword.toLowerCase();
  return [b.title, b.subtitle, b.author, b.translator, b.publisher, b.isbn]
    .filter(Boolean)
    .some(v => String(v).toLowerCase().includes(k));
}

function renderBooks() {
  const rows = books.filter(matches).sort((a, b) => {
    // 在看的排最前 —— 这些是手上正读的，最常要打卡
    const rank = s => s === '在看' ? 0 : s === '未看' ? 1 : 2;
    return rank(a.status) - rank(b.status) || (b.at || 0) - (a.at || 0);
  });

  const ul = $('books');
  ul.innerHTML = '';

  $('empty').style.display = rows.length ? 'none' : 'block';
  $('empty').innerHTML = books.length
    ? '没有符合条件的书'
    : '书架还空着<br>扫一本书的条形码开始';

  rows.forEach(b => ul.appendChild(bookRow(b)));

  $('count').textContent = books.length
    ? `${pad(rows.length)} / ${pad(books.length)} 册`
    : '';
}

function bookRow(b) {
  const li = document.createElement('li');

  // 状态用一个色点表示，不占文字宽度。橙色=在看
  const sdot = document.createElement('div');
  sdot.className = 'bk-dot ' + (STATUS_CLASS[b.status] || '');
  sdot.title = b.status;

  const main = document.createElement('div');
  main.className = 'bk-main';
  main.style.cursor = 'pointer';
  main.onclick = () => openBook(b.id);

  const t = document.createElement('div');
  t.className = 'bk-title';
  t.textContent = b.title;
  main.appendChild(t);

  // 作者和出版社跟书名同一行，靠字号和灰度分层
  const metaText = [b.author, b.publisher].filter(Boolean).join(' · ');
  if (metaText) {
    const meta = document.createElement('div');
    meta.className = 'bk-meta';
    meta.textContent = metaText;
    main.appendChild(meta);
  }

  const tail = document.createElement('div');
  tail.className = 'bk-tail';

  const days = (b.checkins || []).length;
  const hitToday = (b.checkins || []).includes(today());

  const tick = document.createElement('button');
  tick.type = 'button';
  tick.className = 'tick' + (hitToday ? ' on' : '');
  tick.textContent = hitToday ? '今天已读' : '打卡';
  tick.title = hitToday ? '再点一次取消今天的打卡' : '记一次「今天读了这本」';
  tick.onclick = async e => {
    e.stopPropagation();
    await toggleCheckin(b.id, today());
  };

  if (days) {
    const d = document.createElement('div');
    d.className = 'bk-days';
    d.textContent = days + ' 天';
    tail.appendChild(d);
  }

  tail.appendChild(tick);

  li.append(sdot, main, tail);
  return li;
}

/* ============================================================
   打卡
   ------------------------------------------------------------
   一天可以给多本书各打一次 —— 打卡存在每本书自己的 checkins 里，
   本来就互不干扰，不需要额外处理。
   同一本书同一天只算一次，再点是取消（记错了能撤）。
   ============================================================ */

async function toggleCheckin(bookId, date) {
  const b = await DB.getBook(bookId);
  if (!b) return;

  const set = new Set(b.checkins || []);
  if (set.has(date)) {
    set.delete(date);
  } else {
    set.add(date);
    // 未看的书一打卡就自动变「在看」，省一次手动改状态
    if (b.status === '未看') b.status = '在看';
  }
  b.checkins = Array.from(set).sort();

  await DB.putBook(b);

  // 内存里同步一份，避免整表重读
  const i = books.findIndex(x => x.id === bookId);
  if (i >= 0) books[i] = b;

  renderStats();
  renderFilters();
  renderBooks();
  if (openBookId === bookId) renderDetail(b);
}

/* ============================================================
   详情页
   ============================================================ */

async function openBook(id) {
  const b = await DB.getBook(id);
  if (!b) return;
  openBookId = id;

  // 日历默认落在有内容的月份：有打卡就停在最近一次，否则本月
  const last = (b.checkins || []).slice(-1)[0];
  const base = last ? new Date(last + 'T00:00:00') : new Date();
  calY = base.getFullYear();
  calM = base.getMonth();

  await renderDetail(b);
  show('book');
}

async function renderDetail(b) {
  const [excerpts, thoughts] = await Promise.all([
    DB.listBy('excerpts', b.id),
    DB.listBy('thoughts', b.id)
  ]);

  const box = $('detail');
  box.innerHTML = '';

  /* ---- 头部 ---- */
  const h2 = document.createElement('h2');
  h2.textContent = b.title;
  box.appendChild(h2);

  if (b.subtitle) {
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = b.subtitle;
    box.appendChild(sub);
  }

  /* ---- 状态切换 + 编辑/删除 ---- */
  const ops = document.createElement('div');
  ops.className = 'row';
  ops.style.margin = '18px 0 4px';

  STATUSES.forEach(s => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip' + (s === b.status ? ' on' : '');
    c.textContent = s;
    c.onclick = async () => {
      b.status = s;
      await DB.putBook(b);
      const i = books.findIndex(x => x.id === b.id);
      if (i >= 0) books[i] = b;
      renderStats(); renderFilters(); renderBooks();
      renderDetail(b);
    };
    ops.appendChild(c);
  });
  box.appendChild(ops);

  const ops2 = document.createElement('div');
  ops2.className = 'row';
  ops2.style.marginTop = '10px';

  const ed = document.createElement('button');
  ed.type = 'button';
  ed.className = 'btn-ghost btn-sm';
  ed.textContent = '编辑信息';
  ed.onclick = () => openEdit(b);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'btn-ghost btn-sm';
  del.textContent = '删除这本';
  del.onclick = async () => {
    const n = excerpts.length + thoughts.length;
    const extra = n ? `\n连带 ${excerpts.length} 条摘录、${thoughts.length} 篇感想一起删掉，无法恢复。` : '';
    if (!confirm(`删除「${b.title}」？${extra}`)) return;
    await DB.deleteBook(b.id);
    openBookId = null;
    await reload();
    show('list');
  };

  ops2.append(ed, del);
  box.appendChild(ops2);

  /* ---- 书目信息 ---- */
  const info = [
    ['作者', b.author],
    ['译者', b.translator],
    ['出版', [b.publisher, b.pubdate].filter(Boolean).join(' ')],
    ['页数', b.pages],
    ['买入', b.bought],
    ['ISBN', b.isbn],
    ['备注', b.note]
  ].filter(r => r[1]);

  if (info.length) {
    const dl = document.createElement('dl');
    dl.className = 'info';
    info.forEach(([k, v]) => {
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      dl.append(dt, dd);
    });
    box.appendChild(dl);
  }

  /* ---- 打卡日历 ---- */
  box.appendChild(segHead('Calendar', '阅读打卡',
    (b.checkins || []).length ? (b.checkins.length + ' 天') : ''));
  box.appendChild(buildCalendar(b));

  /* ---- 摘录 ---- */
  box.appendChild(segHead('Excerpts', '摘录',
    excerpts.length ? (excerpts.length + ' 条') : ''));
  box.appendChild(noteComposer('excerpt', b.id));
  box.appendChild(noteList('excerpts', excerpts, b));

  /* ---- 感想 ---- */
  box.appendChild(segHead('Thoughts', '感想',
    thoughts.length ? (thoughts.length + ' 篇') : ''));
  box.appendChild(noteComposer('thought', b.id));
  box.appendChild(noteList('thoughts', thoughts, b));
}

function segHead(overline, title, count) {
  const d = document.createElement('div');
  d.className = 'seg';

  const left = document.createElement('div');
  const ol = document.createElement('div');
  ol.className = 'overline sec';
  ol.textContent = overline;
  const h = document.createElement('div');
  h.className = 'title-medium';
  h.style.fontSize = '22px';
  h.style.marginTop = '6px';
  h.textContent = title;
  left.append(ol, h);

  const c = document.createElement('span');
  c.className = 'note-when';
  c.textContent = count;

  d.append(left, c);
  return d;
}

/* ============================================================
   每本书自己的打卡日历
   ------------------------------------------------------------
   点任意一天切换那天的打卡状态 —— 不只是今天，
   补记前几天读过的也行（用户经常隔几天才想起来记）。
   未来的日期点不了，避免误触。
   ============================================================ */

function buildCalendar(b) {
  const wrap = document.createElement('div');
  const hits = new Set(b.checkins || []);

  /* 月份导航 */
  const top = document.createElement('div');
  top.className = 'cal-top';

  const title = document.createElement('div');
  title.className = 'cal-title';
  title.textContent = `${calY} / ${pad(calM + 1)}`;

  const nav = document.createElement('div');
  nav.className = 'cal-nav';

  const mk = (label, fn) => {
    const x = document.createElement('button');
    x.type = 'button';
    x.textContent = label;
    x.onclick = () => { fn(); renderDetail(b); };
    return x;
  };

  nav.append(
    mk('‹', () => { calM--; if (calM < 0) { calM = 11; calY--; } }),
    mk('·', () => { const d = new Date(); calY = d.getFullYear(); calM = d.getMonth(); }),
    mk('›', () => { calM++; if (calM > 11) { calM = 0; calY++; } })
  );

  top.append(title, nav);
  wrap.appendChild(top);

  /* 星期表头，周一起始 */
  const wk = document.createElement('div');
  wk.className = 'cal-week';
  ['一', '二', '三', '四', '五', '六', '日'].forEach(d => {
    const s = document.createElement('span');
    s.textContent = d;
    wk.appendChild(s);
  });
  wrap.appendChild(wk);

  /* 日期格 */
  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  const first = new Date(calY, calM, 1);
  const lead = (first.getDay() + 6) % 7;          // 周一为一周起点
  const days = new Date(calY, calM + 1, 0).getDate();
  const t = today();

  for (let i = 0; i < lead; i++) {
    const c = document.createElement('div');
    c.className = 'cell pad';
    grid.appendChild(c);
  }

  for (let d = 1; d <= days; d++) {
    const key = ymd(calY, calM, d);
    const isFuture = key > t;

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell'
      + (hits.has(key) ? ' hit' : '')
      + (key === t ? ' today' : '')
      + (isFuture ? ' future' : '');
    cell.textContent = d;
    cell.disabled = isFuture;
    cell.title = isFuture ? '' : (hits.has(key) ? key + ' 已打卡，点击取消' : '记一次' + key + '读过');

    if (!isFuture) {
      cell.onclick = () => toggleCheckin(b.id, key);
    }

    grid.appendChild(cell);
  }

  wrap.appendChild(grid);

  /* 脚注：本月读了几天 + 最近一次 */
  const monthPrefix = `${calY}-${pad(calM + 1)}`;
  const inMonth = (b.checkins || []).filter(x => x.startsWith(monthPrefix)).length;
  const last = (b.checkins || []).slice(-1)[0];

  const foot = document.createElement('div');
  foot.className = 'cal-foot';
  foot.textContent = inMonth
    ? `本月读了 ${inMonth} 天` + (last ? `，最近一次 ${last}` : '')
    : '这个月还没打卡。点任意一天可以补记';
  wrap.appendChild(foot);

  return wrap;
}

/* ============================================================
   摘录 / 感想
   ------------------------------------------------------------
   摘录有两栏：书上的原文 + 我的批注（可空）。
   感想只有一栏正文，一本书能写多篇。
   ============================================================ */

function noteComposer(kind, bookId) {
  const box = document.createElement('div');
  box.className = 'form-grid';
  box.style.marginBottom = '18px';

  const isEx = kind === 'excerpt';

  let pageInput = null;
  if (isEx) {
    const wrap = document.createElement('div');
    const lab = document.createElement('label');
    lab.className = 'lab';
    lab.textContent = '页码（可空）';
    pageInput = document.createElement('input');
    pageInput.type = 'text';
    pageInput.className = 'field';
    pageInput.inputMode = 'numeric';
    pageInput.style.maxWidth = '140px';
    wrap.append(lab, pageInput);
    box.appendChild(wrap);
  }

  const main = document.createElement('textarea');
  main.className = 'field';
  main.placeholder = isEx ? '抄一段书里的话' : '读到这里，我想到…';
  box.appendChild(main);

  let mine = null;
  if (isEx) {
    mine = document.createElement('textarea');
    mine.className = 'field';
    mine.style.minHeight = '68px';
    mine.placeholder = '我的批注（可空）';
    box.appendChild(mine);
  }

  const row = document.createElement('div');
  row.className = 'row';

  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'btn';
  save.textContent = isEx ? '记下这段' : '写下感想';
  save.onclick = async () => {
    const text = main.value.trim();
    if (!text) { main.focus(); return; }

    const row = {
      id: uid(),
      bookId,
      text,
      at: Date.now()
    };
    if (isEx) {
      row.page = (pageInput.value || '').trim();
      row.mine = (mine.value || '').trim();
    }

    await DB.put(isEx ? 'excerpts' : 'thoughts', row);

    main.value = '';
    if (isEx) { pageInput.value = ''; mine.value = ''; }

    const b = await DB.getBook(bookId);
    renderDetail(b);
  };

  row.appendChild(save);
  box.appendChild(row);

  return box;
}

function noteList(store, rows, book) {
  const isEx = store === 'excerpts';

  if (!rows.length) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.style.padding = '34px 24px';
    e.style.fontSize = '14px';
    e.textContent = isEx ? '还没有摘录' : '还没有感想';
    return e;
  }

  const ul = document.createElement('ul');
  ul.className = 'notes';

  rows.sort((a, b) => (b.at || 0) - (a.at || 0)).forEach(r => {
    const li = document.createElement('li');

    const text = document.createElement('div');
    text.className = isEx ? 'ex-text' : 'th-text';
    text.textContent = r.text;
    li.appendChild(text);

    if (isEx && r.mine) {
      const m = document.createElement('div');
      m.className = 'ex-mine';
      m.textContent = '— ' + r.mine;
      li.appendChild(m);
    }

    const foot = document.createElement('div');
    foot.className = 'note-foot';

    const when = document.createElement('span');
    when.className = 'note-when';
    const d = new Date(r.at || Date.now());
    when.textContent = [
      isEx && r.page ? 'P' + r.page : '',
      `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
    ].filter(Boolean).join('  ·  ');

    const acts = document.createElement('div');
    acts.className = 'note-acts';

    const ed = document.createElement('button');
    ed.type = 'button';
    ed.className = 'iconbtn';
    ed.textContent = '✎';
    ed.title = '编辑';
    ed.onclick = async () => {
      const v = prompt(isEx ? '改摘录原文' : '改感想', r.text);
      if (v === null) return;
      const t = v.trim();
      if (!t) { alert('内容不能为空'); return; }
      r.text = t;
      await DB.put(store, r);
      renderDetail(await DB.getBook(book.id));
    };

    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'iconbtn';
    rm.textContent = '×';
    rm.title = '删除';
    rm.onclick = async () => {
      if (!confirm(isEx ? '删掉这条摘录？' : '删掉这篇感想？')) return;
      await DB.remove(store, r.id);
      renderDetail(await DB.getBook(book.id));
    };

    acts.append(ed, rm);
    foot.append(when, acts);
    li.appendChild(foot);

    ul.appendChild(li);
  });

  return ul;
}

/* ============================================================
   入库 / 编辑表单
   ============================================================ */

function syncForm() {
  $('f-isbn').value = draft.isbn;
  $('f-title').value = draft.title;
  $('f-author').value = draft.author;
  $('f-translator').value = draft.translator;
  $('f-publisher').value = draft.publisher;
  $('f-pubdate').value = draft.pubdate;
  $('f-pages').value = draft.pages;
  $('f-bought').value = draft.bought;
  $('f-note').value = draft.note;

  renderStatusPicker();
  $('sugg').innerHTML = '';
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

/** 表单里的值收回 draft，保存和查重前都要先调 */
function collectForm() {
  draft.isbn = cleanISBN($('f-isbn').value);
  draft.title = $('f-title').value.trim();
  draft.author = $('f-author').value.trim();
  draft.translator = $('f-translator').value.trim();
  draft.publisher = $('f-publisher').value.trim();
  draft.pubdate = $('f-pubdate').value.trim();
  draft.pages = $('f-pages').value.replace(/[^0-9]/g, '');
  draft.bought = $('f-bought').value || today();
  draft.note = $('f-note').value.trim();
}

function openAdd(withScan) {
  editingId = null;
  draft = blankDraft();
  syncForm();
  $('edit-mode').textContent = 'Add';
  $('dupe-box').innerHTML = '';
  $('scan-msg').textContent = withScan
    ? '点「开摄像头」，对准书背面那串黑白竖线（条形码，不是二维码）'
    : '';
  $('scan-box').style.display = withScan ? 'block' : 'none';
  $('f-save').textContent = '存进书架';
  show('edit');
  if (!withScan) $('f-title').focus();
}

function openEdit(book) {
  editingId = book.id;
  draft = Object.assign(blankDraft(), book);
  syncForm();
  $('edit-mode').textContent = 'Edit';
  $('dupe-box').innerHTML = '';
  $('scan-box').style.display = 'none';
  $('f-save').textContent = '保存修改';
  show('edit');
}

$('go-scan').onclick = () => openAdd(true);
$('go-manual').onclick = () => openAdd(false);
$('edit-back').onclick = () => { stopScan(); show('list'); };
$('f-cancel').onclick = () => { stopScan(); show('list'); };
$('book-back').onclick = () => { openBookId = null; show('list'); };

/* ---------- 查重：这个工具存在的理由 ---------- */

/**
 * 查库里有没有这本书。
 * ISBN 精确匹配优先；没有 ISBN 的（老书无条码）退回「书名+作者」软匹配。
 */
async function findDupe({ isbn, title, author }) {
  if (isbn) {
    const hit = await DB.findByISBN(isbn);
    if (hit && hit.id !== editingId) return { book: hit, by: 'isbn' };
  }
  if (title) {
    const t = title.trim().toLowerCase();
    const a = (author || '').trim().toLowerCase();
    const hit = books.find(b =>
      b.id !== editingId &&
      b.title.trim().toLowerCase() === t &&
      (!a || !b.author || b.author.trim().toLowerCase() === a)
    );
    if (hit) return { book: hit, by: 'title' };
  }
  return null;
}

function showDupe(dupe) {
  const box = $('dupe-box');
  box.innerHTML = '';
  if (!dupe) return;

  const { book: b, by } = dupe;

  const d = document.createElement('div');
  d.className = 'dupe';

  const t = document.createElement('b');
  t.textContent = '这本已经有了';

  const s = document.createElement('span');
  const days = (b.checkins || []).length;
  s.textContent = [
    `《${b.title}》`,
    b.bought ? `${b.bought} 买入` : '',
    `状态：${b.status}`,
    days ? `已读 ${days} 天` : '',
    by === 'title' ? '（按书名+作者匹配到的，ISBN 没对上）' : ''
  ].filter(Boolean).join(' · ');

  d.append(t, s);

  const row = document.createElement('div');
  row.className = 'row';
  row.style.marginTop = '13px';

  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'btn-ghost btn-sm';
  go.style.borderColor = 'rgba(255,255,255,.55)';
  go.style.color = '#fff';
  go.textContent = '去看这本';
  go.onclick = () => { stopScan(); openBook(b.id); };

  row.appendChild(go);
  d.appendChild(row);

  box.appendChild(d);
}

/* ---------- 按 ISBN 查书目 ---------- */

async function doLookup(isbn) {
  isbn = cleanISBN(isbn);
  if (isbn.length !== 13 && isbn.length !== 10) {
    $('scan-msg').textContent = 'ISBN 应该是 13 位（老书可能 10 位），现在是 ' + isbn.length + ' 位';
    return;
  }

  $('f-isbn').value = isbn;

  // 先查重，比查书目更要紧 —— 站在书店里最想知道的就是这个
  collectForm();
  const dupe = await findDupe({ isbn, title: draft.title, author: draft.author });
  showDupe(dupe);

  $('scan-msg').textContent = '正在查书目…';
  $('f-lookup').disabled = true;

  try {
    const d = await lookupISBN(isbn);
    if (d && d.title) {
      const got = fromDouban(d);
      // 已填的不覆盖，避免把用户手动改过的内容冲掉
      Object.keys(got).forEach(k => {
        if (got[k] && !draft[k]) draft[k] = got[k];
      });
      draft.isbn = isbn;
      syncForm();
      $('scan-msg').textContent = '查到了：' + got.title
        + (dupe ? '\n注意：这本书架上已经有了（看上面）' : '');
    } else {
      $('scan-msg').textContent = '查不到这本书（冷门书或太新都有可能），下面手动填就行';
    }
  } catch (e) {
    $('scan-msg').textContent = '查询失败：' + e.message + '\n下面手动填一样能存';
  } finally {
    $('f-lookup').disabled = false;
  }
}

$('f-lookup').onclick = () => doLookup($('f-isbn').value);
$('f-isbn').onkeydown = e => {
  if (e.key === 'Enter') { e.preventDefault(); doLookup($('f-isbn').value); }
};

/* ---------- 按书名搜（扫不到码时的兜底） ---------- */

$('f-search').onclick = async () => {
  const q = $('f-title').value.trim();
  if (!q) { $('f-title').focus(); return; }

  const btn = $('f-search');
  btn.disabled = true;
  btn.textContent = '搜索中';
  $('sugg').innerHTML = '';

  try {
    const res = await searchByTitle(q);
    const list = (res && res.books || []).map(fromDouban).filter(b => b.title);

    if (!list.length) {
      $('scan-msg').textContent = '没搜到，换个更完整的书名试试，或者直接手填';
      return;
    }

    const ul = $('sugg');
    list.forEach(b => {
      const li = document.createElement('li');

      const t = document.createElement('div');
      t.className = 'sugg-t';
      t.textContent = b.title;
      const s = document.createElement('div');
      s.className = 'sugg-s';
      s.textContent = [b.author, b.publisher, b.pubdate].filter(Boolean).join(' · ');

      li.append(t, s);
      li.onclick = async () => {
        Object.keys(b).forEach(k => { if (b[k]) draft[k] = b[k]; });
        syncForm();
        const dupe = await findDupe({ isbn: b.isbn, title: b.title, author: b.author });
        showDupe(dupe);
        $('scan-msg').textContent = dupe
          ? '注意：这本书架上已经有了（看上面）'
          : '已填入，核对一下就能存';
      };

      ul.appendChild(li);
    });
  } catch (e) {
    $('scan-msg').textContent = '搜索失败：' + e.message;
  } finally {
    btn.disabled = false;
    btn.textContent = '按名搜';
  }
};

/* ---------- 保存 ---------- */

$('f-save').onclick = async () => {
  collectForm();

  if (!draft.title) {
    alert('至少要有书名');
    $('f-title').focus();
    return;
  }

  // 新增时如果重了，再确认一次 —— 有时确实会故意买两本（送人、不同版本）
  if (!editingId) {
    const dupe = await findDupe(draft);
    if (dupe) {
      showDupe(dupe);
      const ok = confirm(
        `书架上已经有《${dupe.book.title}》了。\n\n`
        + '确定 = 仍然存一本（比如不同版本、或者要送人）\n取消 = 不存'
      );
      if (!ok) return;
    }
  }

  const old = editingId ? await DB.getBook(editingId) : null;

  const rec = Object.assign({}, draft, {
    id: editingId || uid(),
    // 编辑时打卡记录和创建时间都保留，别被表单覆盖掉
    checkins: old ? (old.checkins || []) : [],
    at: old ? old.at : Date.now()
  });

  try {
    await DB.putBook(rec);
  } catch (e) {
    alert('保存失败：' + (e.message || e));
    return;
  }

  stopScan();
  await reload();

  if (editingId) {
    openBook(rec.id);          // 编辑完回到这本书
  } else {
    show('list');
  }
};

/* ============================================================
   扫码
   ------------------------------------------------------------
   只认 EAN-13 / EAN-8 / UPC-A —— 书用的就是 EAN-13。
   限定格式能减少误识（也不会把书上的二维码扫进来，
   那些是出版社公众号之类，里面没有书目数据）。
   ============================================================ */

let scanner = null;

$('scan-start').onclick = async () => {
  if (!window.Html5Qrcode) {
    $('scan-msg').textContent = '扫码组件没加载成功，先用「按名搜」或手填';
    return;
  }

  const F = window.Html5QrcodeSupportedFormats;
  scanner = new window.Html5Qrcode('reader', {
    formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A],
    verbose: false
  });

  $('scan-msg').textContent = '正在开摄像头…（会问一次权限）';

  try {
    await scanner.start(
      { facingMode: 'environment' },                 // 手机优先后置
      { fps: 10, qrbox: { width: 280, height: 160 } },
      text => {                                       // 识别成功
        $('scan-msg').textContent = '扫到：' + text;
        stopScan();
        doLookup(text);
      },
      () => {}                                        // 每帧未识别，忽略
    );
    $('scan-start').disabled = true;
    $('scan-stop').disabled = false;
    $('scan-msg').textContent = '对准条形码，让它横着占满取景框';
  } catch (e) {
    scanner = null;
    $('scan-msg').textContent = '摄像头打不开：' + (e && e.message ? e.message : e)
      + '\n检查一下是否允许了摄像头权限。也可以直接手输 ISBN 或按书名搜。';
  }
};

async function stopScan() {
  if (!scanner) return;
  try { await scanner.stop(); scanner.clear(); } catch {}
  scanner = null;
  $('scan-start').disabled = false;
  $('scan-stop').disabled = true;
  $('reader').innerHTML = '';
}

$('scan-stop').onclick = stopScan;

/* ============================================================
   搜索
   ============================================================ */

let searchTimer = null;
$('search').oninput = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    keyword = $('search').value.trim();
    renderBooks();
  }, 180);
};

/* ============================================================
   备份
   ------------------------------------------------------------
   数据在 IndexedDB，但备份文件格式跟工作台其他工具保持一致
   （{tool, exportedAt, version, data}），用户不用记两套东西。
   ============================================================ */

$('export').onclick = async () => {
  const data = await DB.exportAll();
  if (!data.books.length) { alert('书架还是空的，没什么可导出'); return; }

  const payload = {
    tool: 'library',
    exportedAt: new Date().toISOString(),
    version: 1,
    data
  };

  const d = new Date();
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `library-${stamp}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

$('import').onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';

  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      let payload;
      try {
        payload = JSON.parse(reader.result);
      } catch {
        alert('这个文件不是有效的备份文件');
        return;
      }

      const data = (payload && payload.data) ? payload.data : payload;
      if (!data || !Array.isArray(data.books)) {
        alert('备份里没有书籍数据');
        return;
      }

      if (payload.tool && payload.tool !== 'library') {
        if (!confirm(`这份备份来自「${payload.tool}」，不是藏书馆。仍然导入？`)) return;
      }

      let mode = 'replace';
      if (books.length) {
        mode = confirm(
          `备份里有 ${data.books.length} 本，当前有 ${books.length} 本。\n\n`
          + '确定 = 合并（保留现有，追加没有的）\n取消 = 用备份完全替换'
        ) ? 'merge' : 'replace';
      }

      try {
        const r = await DB.importAll(data, mode);
        await reload();
        alert(mode === 'merge'
          ? `已合并，新增 ${r.added} 本`
          : `已替换为备份内容，共 ${r.total} 本`);
      } catch (e) {
        alert('导入失败：' + (e.message || e));
      }
    };

    reader.onerror = () => alert('读取文件失败');
    reader.readAsText(file);
  };

  input.click();
};

/** 把已用空间显示出来，让用户对「还能写多少」有数 */
async function renderQuota() {
  const q = await DB.quota();
  const base = '清除浏览器数据、删掉这个应用、或者换手机，本地数据都会丢。'
    + '摘录和感想攒起来不容易，建议定期导出一份。';

  if (!q || !q.quota) { $('quota').textContent = base; return; }

  const mb = n => (n / 1024 / 1024).toFixed(1);
  const [ex, th] = await Promise.all([DB.countAll('excerpts'), DB.countAll('thoughts')]);

  $('quota').textContent = base
    + `\n\n现在存了 ${books.length} 本书、${ex} 条摘录、${th} 篇感想，`
    + `占用 ${mb(q.usage)} MB，可用额度约 ${mb(q.quota)} MB。`;
}

/* ============================================================
   启动
   ============================================================ */

(async () => {
  try {
    // 争取一下持久化授权，降低被 iOS 的 ITP 清理掉的概率
    DB.persist().catch(() => {});
    await reload();
  } catch (e) {
    $('empty').style.display = 'block';
    $('empty').textContent = '数据库打不开：' + (e.message || e)
      + '（隐私模式下浏览器会禁用本地存储）';
  }
})();
