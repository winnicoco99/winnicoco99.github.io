/* ============================================================
   棋谱库 —— 记录对局，变招一并保存
   ------------------------------------------------------------
   数据结构（localStorage 的 workbench.chess）：
   {
     games: [{
       id, white, black, date:'YYYY-MM-DD', result, event,
       tags:[], note, startFen, root（着法树）, headers（原始 PGN 标签）,
       at
     }],
     positions: []      // 局面收藏，下一步做
   }

   着法树的形状和操作都在 pgn.js 里，这里只管界面和存储。
   ============================================================ */

const store = new Store('chess');

/* ---------- 数据规整 ---------- */

// 导入的数据可能结构不对，收敛成合法形状，避免页面崩掉
function normalize(raw) {
  const d = (raw && typeof raw === 'object') ? raw : {};
  const games = (Array.isArray(d.games) ? d.games : []).map(g => ({
    id:       g.id || PGN.uid(),
    white:    String(g.white || ''),
    black:    String(g.black || ''),
    date:     /^\d{4}-\d{2}-\d{2}$/.test(g.date) ? g.date : today(),
    result:   ['*', '1-0', '0-1', '1/2-1/2'].includes(g.result) ? g.result : '*',
    event:    String(g.event || ''),
    tags:     Array.isArray(g.tags) ? g.tags.map(String) : [],
    note:     String(g.note || ''),
    startFen: (g.startFen && PGN.Engine.validFen(g.startFen)) ? g.startFen : PGN.START_FEN,
    root:     normalizeTree(g.root),
    headers:  (g.headers && typeof g.headers === 'object') ? g.headers : {},
    at:       g.at || Date.now()
  }));
  const positions = Array.isArray(d.positions) ? d.positions : [];
  return { games, positions };
}

/* 树可能来自手改的备份文件，逐个节点补齐字段 */
function normalizeTree(raw) {
  if (!raw || typeof raw !== 'object') return PGN.newRoot();
  const walk = (n, isRoot) => ({
    id:        isRoot ? 'root' : (n.id || PGN.uid()),
    san:       String(n.san || ''),
    from:      String(n.from || ''),
    to:        String(n.to || ''),
    promotion: String(n.promotion || ''),
    fen:       String(n.fen || ''),
    comment:   String(n.comment || ''),
    nags:      Array.isArray(n.nags) ? n.nags.map(String) : [],
    children:  (Array.isArray(n.children) ? n.children : []).map(c => walk(c, false))
  });
  return walk(raw, true);
}

let db = normalize(store.load(null));
const persist = () => store.save(db);

function today() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const $ = id => document.getElementById(id);

/* ============================================================
   当前正在看 / 编辑的这一局
   ============================================================ */

const cur = {
  id: null,              // null = 还没保存过的新局
  startFen: PGN.START_FEN,
  root: PGN.newRoot(),
  nodeId: 'root',        // 光标停在哪个着法上
  headers: {}
};

/**
 * 手上有没有「录了但没存」的棋。
 * 已保存的局走子会自动写回，所以只有 cur.id 为空时才算脏。
 */
function isDirty() {
  return !cur.id && cur.root.children.length > 0;
}

/**
 * 要丢掉当前棋局前问一句。棋录了半天被无声覆盖是最气人的，
 * 所以这里宁可多问。返回 true 表示可以继续。
 */
function confirmDiscard(what) {
  if (!isDirty()) return true;
  const n = PGN.countAll(cur.root);
  return confirm(
    `当前这局录了 ${n} 着还没保存，${what}会丢掉。\n\n` +
    '确定 = 丢掉继续\n取消 = 留在这里（可以先点「保存这局」）'
  );
}

let board = null;

/** 光标所在节点 */
function curNode() {
  return PGN.findNode(cur.root, cur.nodeId) || cur.root;
}

/** 光标处的局面 FEN */
function curFen() {
  const n = curNode();
  return n.fen || cur.startFen;
}

/* ============================================================
   棋盘同步
   ============================================================ */

function syncBoard() {
  const n = curNode();
  board.setFen(curFen());
  board.setLastMove(n.san ? { from: n.from, to: n.to } : null);
  renderMoves();
  renderStatus();
  renderNav();
}

function renderStatus() {
  const game = PGN.Engine.create(curFen());
  if (!game) { $('status').textContent = ''; return; }
  const st = PGN.Engine.status(game);
  const n = curNode();
  const total = PGN.countAll(cur.root);
  const ply = PGN.pathTo(cur.root, cur.nodeId).length;

  let s = '';
  if (st.checkmate)      s = st.turn === 'w' ? '白被将杀' : '黑被将杀';
  else if (st.stalemate) s = '无子可动，和棋';
  else if (st.draw)      s = '和棋';
  else if (st.check)     s = st.turn === 'w' ? '白被将军' : '黑被将军';
  else                   s = st.turn === 'w' ? '白方走' : '黑方走';

  const pos = n.san ? `第 ${ply} 手` : '开局';
  $('status').innerHTML =
    `<span class="${(st.checkmate || st.check) ? 'warn' : ''}">${s}</span>` +
    ` · ${pos} · 共 ${total} 着`;
}

function renderNav() {
  const n = curNode();
  const atStart = !n.san;
  const atEnd = !n.children.length;
  $('nav-start').disabled = atStart;
  $('nav-prev').disabled = atStart;
  $('nav-next').disabled = atEnd;
  $('nav-end').disabled = atEnd;

  const found = n.san ? PGN.findParent(cur.root, n.id) : null;
  $('act-promote').disabled = !(found && found.index > 0);
  $('act-undo').disabled = atStart;
}

/* ============================================================
   着法列表：树形渲染，变招缩进
   ============================================================ */

function renderMoves() {
  const box = $('moves');
  box.innerHTML = '';
  if (!cur.root.children.length) return;

  const activePath = new Set(PGN.pathTo(cur.root, cur.nodeId).map(n => n.id));

  /**
   * 渲染一条线路。
   * @param container 挂到哪个 DOM
   * @param node      这条线的第一个着法
   * @param vars      替代 node 的兄弟变招
   * @param needNum   黑方着法是否要显示 "12..."
   */
  function line(container, node, vars, needNum) {
    let cursor = node;
    let curVars = vars || [];
    let needN = needNum;

    while (cursor) {
      const meta = PGN.moveMeta(cursor.fen);

      // 回合号：白方总显示，黑方只在需要时显示。
      // 元素之间插真实空格文本节点，靠 CSS margin 控间距在
      // inline 布局下不可靠（换行处会完全贴住）。
      if (meta.color === 'w' || needN) {
        if (container.childNodes.length) {
          container.appendChild(document.createTextNode(' '));
        }
        const s = document.createElement('span');
        s.className = 'mv-num';
        s.textContent = meta.num + (meta.color === 'w' ? '.' : '...');
        container.appendChild(s);
        container.appendChild(document.createTextNode(' '));
      } else if (container.childNodes.length) {
        container.appendChild(document.createTextNode(' '));
      }
      needN = false;

      // 着法本体
      const b = document.createElement('span');
      b.className = 'mv' + (cursor.id === cur.nodeId ? ' on' : '');
      // 批注符号连在着法里一起显示（Nf3! 是一个整体），
      // 但 $14 这类数字 NAG 不显示，太技术了
      const marks = (cursor.nags || []).filter(x => x && !x.startsWith('$')).join('');
      b.textContent = cursor.san + marks;
      const jumpId = cursor.id;
      b.onclick = () => { cur.nodeId = jumpId; syncBoard(); };
      container.appendChild(b);

      if (cursor.comment) {
        container.appendChild(document.createTextNode(' '));
        const c = document.createElement('span');
        c.className = 'mv-comment';
        c.textContent = cursor.comment.length > 60
          ? cursor.comment.slice(0, 60) + '…' : cursor.comment;
        container.appendChild(c);
      }

      // 变招：整段缩进另起一块，跟在被替代的着法之后
      for (const v of curVars) {
        const div = document.createElement('div');
        div.className = 'varline';
        line(div, v, [], true);
        container.appendChild(div);
      }

      const kids = cursor.children || [];
      if (!kids.length) break;
      // 插过变招之后回到主线，黑方要补回合号才不歧义
      needN = curVars.length > 0;
      curVars = kids.slice(1);
      cursor = kids[0];
    }
  }

  line(box, cur.root.children[0], cur.root.children.slice(1), true);

  // 自动滚到当前着法
  const on = box.querySelector('.mv.on');
  if (on && activePath.size) {
    const top = on.offsetTop - box.clientHeight / 2;
    box.scrollTop = Math.max(0, top);
  }

  const varCount = PGN.countAll(cur.root) - PGN.countMainline(cur.root);
  $('tree-hint').textContent = varCount > 0
    ? `主变 ${PGN.countMainline(cur.root)} 着，另有 ${varCount} 着变招。在任意位置走一步不同的棋，会自动开新分支。`
    : '在任意着法上走一步不同的棋，会自动存成变招，不会覆盖主变。';
}

/* ============================================================
   走子：这是「变招自动分支」的关键
   ============================================================ */

function onUserMove(mv) {
  const node = curNode();

  // 这一步是不是已经有了？有就直接跳过去，不重复存
  const existing = (node.children || []).find(c => c.san === mv.san);
  if (existing) {
    cur.nodeId = existing.id;
    syncBoard();
    return;
  }

  // 新着法挂到当前节点下。已有子节点时它就是变招（children[1..]），
  // 主变（children[0]）不动。
  const fresh = PGN.newNode({
    san: mv.san, from: mv.from, to: mv.to,
    promotion: mv.promotion, fen: mv.fenAfter
  });
  node.children.push(fresh);
  cur.nodeId = fresh.id;

  syncBoard();
  autoSaveIfSaved();
}

/* 已保存过的局，走子后顺手写回，省得每次点保存 */
function autoSaveIfSaved() {
  if (!cur.id) return;
  const g = db.games.find(x => x.id === cur.id);
  if (!g) return;
  g.root = cur.root;
  g.startFen = cur.startFen;
  persist();
  renderGames();
}

/* ============================================================
   导航
   ============================================================ */

function goStart() { cur.nodeId = 'root'; syncBoard(); }

function goPrev() {
  const found = PGN.findParent(cur.root, cur.nodeId);
  cur.nodeId = found ? found.parent.id : 'root';
  syncBoard();
}

function goNext() {
  const n = curNode();
  if (n.children.length) { cur.nodeId = n.children[0].id; syncBoard(); }
}

function goEnd() {
  let n = curNode();
  while (n.children.length) n = n.children[0];
  cur.nodeId = n.id;
  syncBoard();
}

/* ============================================================
   表单 ↔ 当前局
   ============================================================ */

function readForm() {
  return {
    white:  $('f-white').value.trim(),
    black:  $('f-black').value.trim(),
    date:   $('f-date').value || today(),
    result: $('f-result').value,
    event:  $('f-event').value.trim(),
    tags:   $('f-tag').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    note:   $('f-note').value.trim()
  };
}

function fillForm(g) {
  $('f-white').value  = g.white || '';
  $('f-black').value  = g.black || '';
  $('f-date').value   = g.date || today();
  $('f-result').value = g.result || '*';
  $('f-event').value  = g.event || '';
  $('f-tag').value    = (g.tags || []).join(', ');
  $('f-note').value   = g.note || '';
}

/* ============================================================
   保存 / 载入 / 新建
   ============================================================ */

function saveCurrent() {
  if (!cur.root.children.length) {
    alert('还没有着法，先在棋盘上走几步或粘一份 PGN');
    return;
  }
  const form = readForm();

  if (cur.id) {
    const g = db.games.find(x => x.id === cur.id);
    if (g) {
      Object.assign(g, form, { root: cur.root, startFen: cur.startFen, headers: cur.headers });
      persist(); renderGames();
      flash('已更新');
      return;
    }
  }

  const g = Object.assign({
    id: PGN.uid(), startFen: cur.startFen, root: cur.root,
    headers: cur.headers, at: Date.now()
  }, form);
  db.games.unshift(g);
  cur.id = g.id;
  persist(); renderGames();
  flash('已保存');
}

function loadGame(id) {
  const g = db.games.find(x => x.id === id);
  if (!g) return;
  if (!confirmDiscard('打开另一局')) return;
  cur.id = g.id;
  cur.startFen = g.startFen;
  cur.root = g.root;
  cur.nodeId = 'root';
  cur.headers = g.headers || {};
  fillForm(g);
  syncBoard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function newGame() {
  if (!confirmDiscard('清空')) return;
  cur.id = null;
  cur.startFen = PGN.START_FEN;
  cur.root = PGN.newRoot();
  cur.nodeId = 'root';
  cur.headers = {};
  fillForm({ date: today(), result: '*' });
  syncBoard();
}

/* 删掉当前着法及其之后的内容 */
function deleteCurrentMove() {
  const n = curNode();
  if (!n.san) return;
  const kids = PGN.countAll(n);
  const msg = kids > 0
    ? `删除 ${n.san} 以及之后的 ${kids} 着？`
    : `删除 ${n.san}？`;
  if (!confirm(msg)) return;

  const found = PGN.findParent(cur.root, n.id);
  const backTo = found ? found.parent.id : 'root';
  PGN.remove(cur.root, n.id);
  cur.nodeId = backTo;
  syncBoard();
  autoSaveIfSaved();
}

function promoteCurrent() {
  const n = curNode();
  if (!n.san) return;
  if (PGN.promote(cur.root, n.id)) {
    syncBoard();
    autoSaveIfSaved();
    flash('已升为主变');
  }
}

/* ============================================================
   PGN 导入
   ============================================================ */

/** 从 PGN 头部标签推出表单字段 */
function metaFromHeaders(h) {
  let date = today();
  if (h.Date) {
    const m = h.Date.match(/^(\d{4})[.\-/](\d{2})[.\-/](\d{2})$/);
    if (m && m[2] !== '??' && m[3] !== '??') date = `${m[1]}-${m[2]}-${m[3]}`;
  }
  return {
    white:  h.White && h.White !== '?' ? h.White : '',
    black:  h.Black && h.Black !== '?' ? h.Black : '',
    date:   date,
    result: ['1-0', '0-1', '1/2-1/2'].includes(h.Result) ? h.Result : '*',
    event:  h.Event && h.Event !== '?' ? h.Event : '',
    tags:   [h.ECO, h.Opening].filter(x => x && x !== '?'),
    note:   ''
  };
}

function loadPgnToBoard() {
  const text = $('pgn-in').value.trim();
  if (!text) { alert('先把 PGN 粘进来'); return; }

  let parsed;
  try {
    parsed = PGN.parse(PGN.splitGames(text)[0] || text);
  } catch (e) {
    alert('解析失败：' + e.message);
    return;
  }

  if (!parsed.root.children.length) {
    alert('没读到任何着法，检查一下 PGN 格式');
    return;
  }

  if (!confirmDiscard('打开这份 PGN')) return;

  cur.id = null;
  cur.startFen = parsed.startFen;
  cur.root = parsed.root;
  cur.nodeId = 'root';
  cur.headers = parsed.headers;
  fillForm(metaFromHeaders(parsed.headers));
  syncBoard();

  const varN = PGN.countAll(parsed.root) - PGN.countMainline(parsed.root);
  let msg = `读到 ${parsed.moveCount} 着`;
  if (varN > 0) msg += `，含 ${varN} 着变招`;
  if (parsed.errors.length) msg += `；${parsed.errors.length} 个着法没认出来`;
  flash(msg);
}

function importAndSave() {
  const text = $('pgn-in').value.trim();
  if (!text) { alert('先把 PGN 粘进来'); return; }

  const chunks = PGN.splitGames(text);
  let okN = 0, badN = 0, varTotal = 0;

  for (const chunk of chunks) {
    let p;
    try { p = PGN.parse(chunk); } catch (e) { badN++; continue; }
    if (!p.root.children.length) { badN++; continue; }

    const meta = metaFromHeaders(p.headers);
    db.games.unshift(Object.assign({
      id: PGN.uid(), startFen: p.startFen, root: p.root,
      headers: p.headers, at: Date.now()
    }, meta));
    okN++;
    varTotal += PGN.countAll(p.root) - PGN.countMainline(p.root);
  }

  if (!okN) { alert('一局都没导入成功，检查 PGN 格式'); return; }

  persist(); renderGames();
  $('pgn-in').value = '';
  let msg = `导入 ${okN} 局`;
  if (varTotal > 0) msg += `，含 ${varTotal} 着变招`;
  if (badN) msg += `，${badN} 局失败`;
  flash(msg);
}

/* ============================================================
   已存列表
   ============================================================ */

/** 取开局前几手当标题，给没填对手名的局用 */
function openingLabel(g) {
  const sans = [];
  let n = g.root;
  while (n.children && n.children.length && sans.length < 6) {
    n = n.children[0];
    sans.push(n.san);
  }
  if (!sans.length) return '空棋局';

  let out = '', num = 1;
  for (let i = 0; i < sans.length; i++) {
    if (i % 2 === 0) out += (num++) + '. ';
    out += sans[i] + ' ';
  }
  return out.trim() + (PGN.countMainline(g.root) > 6 ? ' …' : '');
}

function renderGames() {
  const ul = $('game-list');
  ul.innerHTML = '';
  const rows = db.games.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.at - a.at);

  $('game-empty').style.display = rows.length ? 'none' : 'block';
  $('game-count').textContent = rows.length ? `${rows.length} 局` : '';

  for (const g of rows) {
    const li = document.createElement('li');

    const main = document.createElement('div');
    main.className = 'gmain';

    const t = document.createElement('div');
    t.className = 'gtitle';
    const w = g.white || '', b = g.black || '';
    // 没填名字时用开局前几手当标题，比「白方 — 黑方」认得出是哪局
    t.textContent = (w || b) ? `${w || '白方'} — ${b || '黑方'}` : openingLabel(g);
    if (g.id === cur.id) {
      const badge = document.createElement('span');
      badge.className = 'gbadge';
      badge.textContent = '正在看';
      t.appendChild(badge);
    }

    const meta = document.createElement('div');
    meta.className = 'gmeta';
    const bits = [g.date, g.result === '*' ? '未结束' : g.result];
    const mainN = PGN.countMainline(g.root);
    const varN = PGN.countAll(g.root) - mainN;
    bits.push(`${mainN} 着`);
    if (varN > 0) bits.push(`变招 ${varN}`);
    if (g.event) bits.push(g.event);
    if (g.tags && g.tags.length) bits.push(g.tags.join(' / '));
    meta.textContent = bits.filter(Boolean).join(' · ');

    main.append(t, meta);
    main.onclick = () => loadGame(g.id);

    const del = document.createElement('button');
    del.className = 'del';
    del.type = 'button';
    del.textContent = '×';
    del.style.cssText = 'background:none;border:none;cursor:pointer;font-family:var(--mono);font-size:16px;color:var(--text-sec);opacity:.5;padding:0 2px';
    del.onclick = e => {
      e.stopPropagation();
      if (!confirm(`删除「${w} — ${b}」？`)) return;
      db.games = db.games.filter(x => x.id !== g.id);
      if (cur.id === g.id) cur.id = null;
      persist(); renderGames();
    };

    li.append(main, del);
    ul.appendChild(li);
  }
}

/* ============================================================
   导出
   ============================================================ */

function exportPgn() {
  if (!db.games.length) { alert('还没有棋局可以导出'); return; }

  const parts = db.games.map(g => {
    const headers = Object.assign({}, g.headers, {
      Event:  g.event || 'Casual Game',
      Date:   (g.date || today()).replace(/-/g, '.'),
      White:  g.white || '?',
      Black:  g.black || '?',
      Result: g.result || '*'
    });
    if (g.note) headers.Annotator = g.note.replace(/[\[\]"]/g, '');
    return PGN.build({ headers, startFen: g.startFen, root: g.root });
  });

  const blob = new Blob([parts.join('\n\n')], { type: 'application/x-chess-pgn' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `棋谱-${today().replace(/-/g, '')}.pgn`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  flash(`导出 ${db.games.length} 局`);
}

/* ============================================================
   小提示条
   ============================================================ */

let flashTimer = null;
function flash(msg) {
  const el = $('status');
  const keep = el.innerHTML;
  el.innerHTML = `<span class="warn">${msg}</span>`;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => renderStatus(), 2200);
}

/* ============================================================
   绑定
   ============================================================ */

document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === t));
    const v = t.dataset.view;
    $('v-game').classList.toggle('on', v === 'game');
    $('v-pos').classList.toggle('on', v === 'pos');
  };
});

$('nav-start').onclick = goStart;
$('nav-prev').onclick  = goPrev;
$('nav-next').onclick  = goNext;
$('nav-end').onclick   = goEnd;
$('nav-flip').onclick  = () => board.flip();

$('act-save').onclick    = saveCurrent;
$('act-new').onclick     = newGame;
$('act-undo').onclick    = deleteCurrentMove;
$('act-promote').onclick = promoteCurrent;
$('act-load').onclick        = loadPgnToBoard;
$('act-import-save').onclick = importAndSave;
$('act-export-pgn').onclick  = exportPgn;

$('act-export').onclick = () => store.exportFile();
$('act-import').onclick = () => {
  store.importFile(data => {
    const incoming = normalize(data);
    if (!incoming.games.length) { alert('备份里没有棋局'); return; }
    let next;
    if (db.games.length) {
      const merge = confirm(
        `备份里有 ${incoming.games.length} 局，当前有 ${db.games.length} 局。\n\n` +
        '确定 = 合并\n取消 = 用备份完全替换'
      );
      if (merge) {
        const seen = new Set(db.games.map(g => g.id));
        const add = incoming.games.filter(g => !seen.has(g.id));
        next = { games: db.games.concat(add), positions: db.positions };
        alert(`已合并，新增 ${add.length} 局`);
      } else {
        next = incoming;
        alert(`已替换为备份内容，共 ${incoming.games.length} 局`);
      }
    } else {
      next = incoming;
      alert(`已恢复 ${incoming.games.length} 局`);
    }
    db = next;
    persist();
    newGame();
    renderGames();
  });
};

// 直接关页面 / 按返回不会经过上面那些检查，浏览器层面再兜一道
window.addEventListener('beforeunload', e => {
  if (!isDirty()) return;
  e.preventDefault();
  e.returnValue = '';   // 触发浏览器自带的「离开此页？」
});

// 键盘左右键翻棋谱，桌面上顺手
document.addEventListener('keydown', e => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
  if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  if (e.key === 'ArrowUp')    { e.preventDefault(); goStart(); }
  if (e.key === 'ArrowDown')  { e.preventDefault(); goEnd(); }
});

/* ---------- 启动 ---------- */

board = new Board($('board'), { onMove: onUserMove });
$('f-date').value = today();
renderGames();
syncBoard();
