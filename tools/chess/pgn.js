/* ============================================================
   PGN 解析 / 导出 —— 完整保留变招
   ------------------------------------------------------------
   为什么自己写：常见的轻量棋类库解析 PGN 时只保留主变，
   把括号里的变招（RAV）直接丢掉。这个工具的核心需求就是
   「变招也要存」，所以解析和导出必须自己来，
   chess.js 只用来当规则裁判（判断着法合法、生成 SAN 和 FEN）。

   着法树结构（存进 localStorage 的形状）：
     node = {
       id, san, from, to, promotion,
       fen,        走完这一步之后的局面
       comment,    这一步之后的注释 {...}
       nags,       ['!', '?!', '$14'] 之类
       children    children[0] = 主变，children[1..] = 变招
     }
   根节点没有 san，只有 children，代表「开局前」。

   PGN 语义要点（最容易写错的地方）：
     1. e4 e5 2. Nf3 (2. Bc4 Bc5) Nc6
   括号里的 Bc4 是「替代 Nf3 这一步」，所以它挂在 Nf3 的
   父节点下，和 Nf3 是兄弟关系，不是 Nf3 的子节点。
   ============================================================ */

(function () {
  'use strict';

  const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  /* ----------------------------------------------------------
     引擎封装层
     chess.js 1.x 遇到非法 FEN / 非法着法会抛异常（旧版是返回
     false / null），方法名也从 in_checkmate 改成 isCheckmate。
     这里统一收口成「失败返回 null / false」的形式，
     以后换引擎版本只需要改这一段。
     ---------------------------------------------------------- */

  const Engine = {
    /** 新建局面。FEN 不合法返回 null，不抛异常。 */
    create(fen) {
      try {
        return fen ? new Chess(fen) : new Chess();
      } catch (e) {
        return null;
      }
    },

    /** 走一步。非法返回 null。san 可以是 SAN 字符串或 {from,to,promotion} */
    move(game, mv) {
      try {
        // strict:false 容忍 Fritz / ChessBase 那类不规范的 SAN
        return game.move(mv, { strict: false }) || null;
      } catch (e) {
        return null;
      }
    },

    /** FEN 是否合法 */
    validFen(fen) {
      if (!fen || typeof fen !== 'string') return false;
      try {
        new Chess(fen);
        return true;
      } catch (e) {
        return false;
      }
    },

    /** 局面状态，用于界面上提示将杀 / 和棋 */
    status(game) {
      try {
        return {
          check: game.isCheck(),
          checkmate: game.isCheckmate(),
          stalemate: game.isStalemate(),
          draw: game.isDraw(),
          over: game.isGameOver(),
          turn: game.turn()
        };
      } catch (e) {
        return { check: false, checkmate: false, stalemate: false,
                 draw: false, over: false, turn: 'w' };
      }
    },

    /** 某格能走到哪些格，用于高亮合法落点 */
    destinations(game, square) {
      try {
        return game.moves({ square: square, verbose: true }).map(m => m.to);
      } catch (e) {
        return [];
      }
    }
  };

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function newNode(fields) {
    return Object.assign({
      id: uid(), san: '', from: '', to: '', promotion: '',
      fen: '', comment: '', nags: [], children: []
    }, fields || {});
  }

  function newRoot() {
    return { id: 'root', san: '', fen: '', comment: '', nags: [], children: [] };
  }

  /* ==========================================================
     一、词法分析
     把 movetext 切成 token 流。注释、括号、NAG、结果都要认出来，
     剩下的当 SAN 处理。
     ========================================================== */

  const RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

  function tokenize(text) {
    const toks = [];
    let i = 0;
    const n = text.length;

    while (i < n) {
      const c = text[i];

      // 空白
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { i++; continue; }

      // 行首 % 是转义行，整行忽略（PGN 标准）
      if (c === '%' && (i === 0 || text[i - 1] === '\n')) {
        while (i < n && text[i] !== '\n') i++;
        continue;
      }

      // { ... } 注释，可跨行
      if (c === '{') {
        let j = i + 1, buf = '';
        while (j < n && text[j] !== '}') { buf += text[j]; j++; }
        toks.push({ t: 'comment', v: buf.trim().replace(/\s+/g, ' ') });
        i = j + 1;
        continue;
      }

      // ; 注释到行尾
      if (c === ';') {
        let j = i + 1, buf = '';
        while (j < n && text[j] !== '\n') { buf += text[j]; j++; }
        toks.push({ t: 'comment', v: buf.trim() });
        i = j;
        continue;
      }

      // 变招括号
      if (c === '(') { toks.push({ t: '(' }); i++; continue; }
      if (c === ')') { toks.push({ t: ')' }); i++; continue;  }

      // <> 是 PGN 保留字符，跳过
      if (c === '<' || c === '>') { i++; continue; }

      // $12 数字 NAG
      if (c === '$') {
        let j = i + 1, num = '';
        while (j < n && /[0-9]/.test(text[j])) { num += text[j]; j++; }
        if (num) toks.push({ t: 'nag', v: '$' + num });
        i = j;
        continue;
      }

      // ! ? 单独出现时当 NAG（有些棋谱里和着法之间有空格）
      if (c === '!' || c === '?') {
        let j = i, buf = '';
        while (j < n && (text[j] === '!' || text[j] === '?')) { buf += text[j]; j++; }
        toks.push({ t: 'nag', v: buf });
        i = j;
        continue;
      }

      // * 是未终局标记
      if (c === '*') { toks.push({ t: 'result', v: '*' }); i++; continue; }

      // 数字开头：可能是结果，也可能是回合号
      if (/[0-9]/.test(c)) {
        const rest = text.slice(i);
        const hit = RESULTS.find(r => r !== '*' && rest.startsWith(r));
        // 1-0 后面不能紧跟别的字符，否则可能是别的东西
        if (hit && !/^[-\w]/.test(rest.slice(hit.length))) {
          toks.push({ t: 'result', v: hit });
          i += hit.length;
          continue;
        }
        // 回合号：数字 + 若干个点
        let j = i;
        while (j < n && /[0-9]/.test(text[j])) j++;
        // 0-0 / 0-0-0 是有些棋谱里的王车易位写法，交给 SAN 分支处理
        if (text[j] === '-') {
          let k = j, word = '';
          while (k < n && !/[\s{};()$]/.test(text[k])) { word += text[k]; k++; }
          toks.push({ t: 'san', v: word });
          i = k;
          continue;
        }
        while (j < n && (text[j] === '.' || text[j] === ' ')) {
          if (text[j] === ' ') break;
          j++;
        }
        toks.push({ t: 'num' });
        i = j;
        continue;
      }

      // 其余当成 SAN，读到分隔符为止
      let j = i, word = '';
      while (j < n && !/[\s{};()$]/.test(text[j])) { word += text[j]; j++; }
      if (word) toks.push({ t: 'san', v: word });
      i = j > i ? j : i + 1;
      continue;
    }

    return toks;
  }

  /* SAN 尾部的 !? 要剥下来当 NAG，否则引擎认不出这个着法 */
  function splitSuffix(san) {
    const m = san.match(/^(.*?)([!?]+)$/);
    if (m) return { san: m[1], nag: m[2] };
    return { san: san, nag: '' };
  }

  /* ==========================================================
     二、语法分析：token 流 → 着法树
     ========================================================== */

  function parseMovetext(toks, startFen) {
    const root = newRoot();
    root.fen = startFen;
    const errors = [];
    const ctx = { toks, i: 0, errors };

    walk(ctx, root, startFen);
    return { root, errors };
  }

  /**
   * 解析一条线路，把着法挂到 mount 底下。
   * @param mount    起始挂载点（这条线第一步的父节点）
   * @param startFen 这条线开始时的局面
   */
  function walk(ctx, mount, startFen) {
    const game = Engine.create(startFen);
    if (!game) return;   // 起始局面不合法，这条线没法解析

    // cur       最近落子的节点
    // curMount  cur 的挂载点（遇到变招时要用）
    // curBefore cur 落子之前的局面（变招要从这里重新开始）
    let cur = mount;
    let curMount = null;
    let curBefore = null;

    while (ctx.i < ctx.toks.length) {
      const tok = ctx.toks[ctx.i];

      if (tok.t === ')') return;              // 交给上层消费
      if (tok.t === 'num') { ctx.i++; continue; }
      if (tok.t === 'result') { ctx.i++; continue; }

      if (tok.t === '(') {
        ctx.i++;
        if (curMount === null) {
          // 还没走子就出现括号，位置不合法，跳过整段避免污染主变
          skipBalanced(ctx);
          continue;
        }
        // 变招替代 cur 这一步：挂到 cur 的挂载点，从 cur 走之前的局面重来
        walk(ctx, curMount, curBefore);
        if (ctx.toks[ctx.i] && ctx.toks[ctx.i].t === ')') ctx.i++;
        continue;
      }

      if (tok.t === 'comment') {
        ctx.i++;
        cur.comment = cur.comment ? (cur.comment + ' ' + tok.v) : tok.v;
        continue;
      }

      if (tok.t === 'nag') {
        ctx.i++;
        if (cur !== mount || cur.san) cur.nags.push(tok.v);
        continue;
      }

      if (tok.t === 'san') {
        ctx.i++;
        const { san, nag } = splitSuffix(tok.v);
        const before = game.fen();
        const mv = Engine.move(game, san);

        if (!mv) {
          // 着法非法（棋谱有误或解析偏差），记下来但继续往后读，
          // 不让一处错误毁掉整局
          ctx.errors.push(san);
          continue;
        }

        const node = newNode({
          san: mv.san,
          from: mv.from,
          to: mv.to,
          promotion: mv.promotion || '',
          fen: game.fen(),
          nags: nag ? [nag] : []
        });

        cur.children.push(node);
        curMount = cur;
        curBefore = before;
        cur = node;
        continue;
      }

      ctx.i++;  // 兜底，避免死循环
    }
  }

  /* 跳过一段配对的括号 */
  function skipBalanced(ctx) {
    let depth = 1;
    while (ctx.i < ctx.toks.length && depth > 0) {
      const t = ctx.toks[ctx.i].t;
      if (t === '(') depth++;
      else if (t === ')') depth--;
      ctx.i++;
    }
  }

  /* ==========================================================
     三、对外：解析整份 PGN（头部标签 + movetext）
     ========================================================== */

  function parse(text) {
    const src = String(text || '').replace(/\r\n?/g, '\n').trim();
    if (!src) throw new Error('内容是空的');

    const headers = {};
    let rest = src;

    // 逐行吃掉开头的 [Tag "value"]
    const lines = src.split('\n');
    let k = 0;
    for (; k < lines.length; k++) {
      const line = lines[k].trim();
      if (!line) continue;
      const m = line.match(/^\[\s*(\w+)\s*"([^"]*)"\s*\]$/);
      if (!m) break;
      headers[m[1]] = m[2];
    }
    rest = lines.slice(k).join('\n');

    const startFen = (headers.FEN && headers.FEN.trim()) ? headers.FEN.trim() : START_FEN;

    // FEN 不合法就退回标准开局，否则整局都解析不出来
    const usableFen = Engine.validFen(startFen) ? startFen : START_FEN;

    const { root, errors } = parseMovetext(tokenize(rest), usableFen);

    return {
      headers: headers,
      startFen: usableFen,
      root: root,
      errors: errors,
      moveCount: countMainline(root)
    };
  }

  /* 一份文件里可能有多局，按空行 + 下一个 [ 开头切开 */
  function splitGames(text) {
    const src = String(text || '').replace(/\r\n?/g, '\n');
    const out = [];
    const lines = src.split('\n');
    let buf = [];
    let seenMoves = false;

    for (const line of lines) {
      const isTag = /^\[\s*\w+\s*"/.test(line.trim());
      if (isTag && seenMoves && buf.length) {
        out.push(buf.join('\n'));
        buf = [];
        seenMoves = false;
      }
      if (!isTag && line.trim()) seenMoves = true;
      buf.push(line);
    }
    if (buf.join('').trim()) out.push(buf.join('\n'));

    return out.filter(g => g.trim());
  }

  /* ==========================================================
     四、导出 PGN（变招写回括号，可导入 lichess / ChessBase）
     ========================================================== */

  function fenTurn(fen) {
    const p = String(fen || '').split(' ');
    return { turn: p[1] || 'w', num: parseInt(p[5], 10) || 1 };
  }

  /* 从「走完这步的 fen」倒推这步的回合号和执子方 */
  function moveMeta(fen) {
    const { turn, num } = fenTurn(fen);
    // 走完后轮到黑走 → 这步是白走的，回合号不变
    if (turn === 'b') return { color: 'w', num: num };
    return { color: 'b', num: num - 1 };
  }

  function nodeToText(node, forceNum) {
    const meta = moveMeta(node.fen);
    let s = '';
    if (meta.color === 'w') s += meta.num + '. ';
    else if (forceNum) s += meta.num + '... ';
    s += node.san;
    if (node.nags && node.nags.length) s += node.nags.filter(x => x).join('');
    if (node.comment) s += ' {' + node.comment.replace(/[{}]/g, '') + '}';
    return s;
  }

  /**
   * 写一条线路。
   * 关键：括号里的变招是「替代某一步」的，所以必须紧跟在被替代的
   * 那一步之后。因此替代当前着法的兄弟变招由上层传进来（vars），
   * 输出自己之后立刻把它们写掉。
   *
   * @param node    这条线的第一个着法
   * @param needNum 黑方着法是否要补 "12..." 前缀
   * @param vars    替代 node 的其他着法
   */
  function lineToText(node, needNum, vars) {
    const parts = [];
    let cur = node;
    let curVars = vars || [];
    let needN = needNum;

    // 主线用循环，避免长棋谱递归过深；只有变招走递归
    while (cur) {
      parts.push(nodeToText(cur, needN));

      for (const v of curVars) {
        parts.push('(' + lineToText(v, true, []) + ')');
      }

      const kids = cur.children || [];
      if (!kids.length) break;

      // 刚插过括号，回到主变时黑方要补 "12..." 才不会歧义
      needN = curVars.length > 0;
      curVars = kids.slice(1);
      cur = kids[0];
    }

    return parts.join(' ');
  }

  function build(game) {
    const h = game.headers || {};
    const order = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result',
                   'WhiteElo', 'BlackElo', 'ECO', 'Opening', 'TimeControl',
                   'Termination', 'Annotator'];
    const lines = [];
    const done = new Set();

    for (const key of order) {
      if (h[key]) { lines.push(`[${key} "${h[key]}"]`); done.add(key); }
    }
    for (const key of Object.keys(h)) {
      if (!done.has(key) && h[key] && key !== 'FEN' && key !== 'SetUp') {
        lines.push(`[${key} "${h[key]}"]`);
      }
    }
    if (game.startFen && game.startFen !== START_FEN) {
      lines.push('[SetUp "1"]');
      lines.push(`[FEN "${game.startFen}"]`);
    }

    let body = '';
    const root = game.root;
    if (root && root.comment) body += '{' + root.comment + '} ';
    if (root && root.children.length) {
      // 第一步就有多个选择时，其余的作为替代变招传进去
      body += lineToText(root.children[0], true, root.children.slice(1));
    }

    const result = h.Result || '*';
    body = (body ? body + ' ' : '') + result;

    return lines.join('\n') + '\n\n' + wrap(body, 80) + '\n';
  }

  /* PGN 习惯每行不超过 80 字符 */
  function wrap(text, width) {
    const words = text.split(' ');
    const out = [];
    let line = '';
    for (const w of words) {
      if (line && (line.length + 1 + w.length) > width) { out.push(line); line = w; }
      else line = line ? (line + ' ' + w) : w;
    }
    if (line) out.push(line);
    return out.join('\n');
  }

  /* ==========================================================
     五、树上的常用操作
     ========================================================== */

  function countMainline(root) {
    let n = 0, cur = root;
    while (cur.children && cur.children.length) { cur = cur.children[0]; n++; }
    return n;
  }

  function countAll(root) {
    let n = 0;
    (function rec(node) {
      for (const c of node.children || []) { n++; rec(c); }
    })(root);
    return n;
  }

  function hasVariations(root) {
    let found = false;
    (function rec(node) {
      if (found) return;
      if ((node.children || []).length > 1) { found = true; return; }
      for (const c of node.children || []) rec(c);
    })(root);
    return found;
  }

  /** 找某个节点的父节点和它在兄弟中的位置 */
  function findParent(root, id) {
    let hit = null;
    (function rec(node) {
      if (hit) return;
      const kids = node.children || [];
      for (let i = 0; i < kids.length; i++) {
        if (kids[i].id === id) { hit = { parent: node, index: i }; return; }
        rec(kids[i]);
        if (hit) return;
      }
    })(root);
    return hit;
  }

  /** 从根到某节点的路径（含该节点），用于着法列表高亮和回退 */
  function pathTo(root, id) {
    const path = [];
    let ok = false;
    (function rec(node, acc) {
      if (ok) return;
      for (const c of node.children || []) {
        acc.push(c);
        if (c.id === id) { ok = true; path.push(...acc); return; }
        rec(c, acc);
        if (ok) return;
        acc.pop();
      }
    })(root, []);
    return ok ? path : [];
  }

  function findNode(root, id) {
    if (!id || id === 'root') return root;
    let hit = null;
    (function rec(node) {
      if (hit) return;
      for (const c of node.children || []) {
        if (c.id === id) { hit = c; return; }
        rec(c);
        if (hit) return;
      }
    })(root);
    return hit;
  }

  /** 把某个变招提升为主变 */
  function promote(root, id) {
    const found = findParent(root, id);
    if (!found || found.index === 0) return false;
    const kids = found.parent.children;
    const [node] = kids.splice(found.index, 1);
    kids.unshift(node);
    return true;
  }

  /** 删掉某节点及其之后的整段 */
  function remove(root, id) {
    const found = findParent(root, id);
    if (!found) return false;
    found.parent.children.splice(found.index, 1);
    return true;
  }

  window.PGN = {
    START_FEN, Engine, uid, newNode, newRoot,
    tokenize, parse, splitGames, build,
    countMainline, countAll, hasVariations,
    findNode, findParent, pathTo, promote, remove, moveMeta
  };
})();
