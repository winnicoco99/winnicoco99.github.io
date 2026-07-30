/* ============================================================
   棋盘渲染 + 走子交互
   ------------------------------------------------------------
   用法：
     const b = new Board(document.getElementById('board'), {
       onMove: (mv) => { ... }      // 用户走了一步合法棋
     });
     b.setFen(fen);                 // 摆局面
     b.flip();                      // 翻转视角
     b.setInteractive(false);        // 只读模式（看棋谱时）

   交互方式按手机优先设计：点起点 → 显示合法落点 → 点终点。
   拖拽也支持，但不是主要方式（小棋盘上容易误触）。
   ============================================================ */

(function () {
  'use strict';

  const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  // 相对 tools/chess/index.html
  const PIECE_DIR = 'pieces/';

  /* 把 chess.js 的 {type:'p', color:'w'} 转成文件名 wP */
  function pieceCode(p) {
    return p.color + p.type.toUpperCase();
  }

  class Board {
    constructor(el, opts) {
      this.el = el;
      this.opts = opts || {};
      this.flipped = false;
      this.interactive = this.opts.interactive !== false;
      this.fen = PGN.START_FEN;
      this.selected = null;        // 当前选中的格子
      this.dests = [];             // 选中棋子的合法落点
      this.lastMove = null;        // {from,to}，用于高亮上一步
      this.checkSquare = null;     // 被将的王所在格，画红圈
      this.squares = {};           // 格名 → DOM
      this.pendingPromotion = null;

      this._build();
      this.setFen(this.fen);
    }

    /* ---------- 构建 DOM 骨架（只建一次，之后只更新棋子） ---------- */

    _build() {
      this.el.classList.add('cb');
      this.el.innerHTML = '';

      const grid = document.createElement('div');
      grid.className = 'cb-grid';
      this.grid = grid;

      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const sq = document.createElement('div');
          sq.className = 'cb-sq ' + ((r + f) % 2 === 0 ? 'light' : 'dark');
          grid.appendChild(sq);
        }
      }

      // 升变选择浮层
      const promo = document.createElement('div');
      promo.className = 'cb-promo';
      promo.style.display = 'none';
      this.promoEl = promo;

      this.el.append(grid, promo);

      // 事件挂在 grid 上做委托，格子重排时不用重新绑
      grid.addEventListener('click', e => this._onClick(e));
      this._layout();
    }

    /** 按当前视角把格名分配到 64 个 DOM 上 */
    _layout() {
      const cells = this.grid.children;
      this.squares = {};
      let i = 0;
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const rank = this.flipped ? r + 1 : 8 - r;
          const file = this.flipped ? FILES[7 - f] : FILES[f];
          const name = file + rank;
          const cell = cells[i++];
          cell.dataset.sq = name;
          // 底色跟着格名算，翻转后不会变成同色相邻
          const isLight = (FILES.indexOf(file) + rank) % 2 !== 0;
          cell.className = 'cb-sq ' + (isLight ? 'light' : 'dark');
          this.squares[name] = cell;
        }
      }
      this._paintCoords();
    }

    /** 坐标只标在左列和底行，跟 lichess 一样不占地方 */
    _paintCoords() {
      for (const name in this.squares) {
        const cell = this.squares[name];
        cell.querySelectorAll('.cb-coord').forEach(n => n.remove());
        const file = name[0], rank = name[1];
        const leftCol = this.flipped ? 'h' : 'a';
        const botRow = this.flipped ? '8' : '1';
        if (file === leftCol) {
          const s = document.createElement('span');
          s.className = 'cb-coord cb-rank';
          s.textContent = rank;
          cell.appendChild(s);
        }
        if (rank === botRow) {
          const s = document.createElement('span');
          s.className = 'cb-coord cb-file';
          s.textContent = file;
          cell.appendChild(s);
        }
      }
    }

    /* ---------- 摆棋 ---------- */

    setFen(fen) {
      const game = PGN.Engine.create(fen);
      if (!game) return false;
      this.fen = fen;
      this.game = game;
      this._render();
      return true;
    }

    setLastMove(mv) {
      this.lastMove = mv || null;
      this._render();
    }

    flip() {
      this.flipped = !this.flipped;
      this._layout();
      this._render();
    }

    setFlipped(v) {
      if (this.flipped === !!v) return;
      this.flip();
    }

    setInteractive(v) {
      this.interactive = !!v;
      this._clearSelection();
    }

    _render() {
      const board = this.game.board();   // 8 行，从第 8 横线开始
      const st = PGN.Engine.status(this.game);

      // 找被将的王，画个红圈提示
      this.checkSquare = null;
      if (st.check || st.checkmate) {
        for (let r = 0; r < 8; r++) {
          for (let f = 0; f < 8; f++) {
            const p = board[r][f];
            if (p && p.type === 'k' && p.color === st.turn) {
              this.checkSquare = FILES[f] + (8 - r);
            }
          }
        }
      }

      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const name = FILES[f] + (8 - r);
          const cell = this.squares[name];
          if (!cell) continue;

          // 只重画棋子层，坐标留着
          cell.querySelectorAll('.cb-piece, .cb-dot, .cb-cap').forEach(n => n.remove());
          cell.classList.remove('sel', 'last', 'chk');

          const p = board[r][f];
          if (p) {
            const img = document.createElement('img');
            img.className = 'cb-piece';
            img.src = PIECE_DIR + pieceCode(p) + '.svg';
            img.alt = '';
            img.draggable = false;
            cell.appendChild(img);
          }

          if (this.selected === name) cell.classList.add('sel');
          if (this.lastMove && (this.lastMove.from === name || this.lastMove.to === name)) {
            cell.classList.add('last');
          }
          if (this.checkSquare === name) cell.classList.add('chk');

          // 合法落点：空格画点，有子画圈（lichess 的视觉语言）
          if (this.dests.includes(name)) {
            const mark = document.createElement('span');
            mark.className = p ? 'cb-cap' : 'cb-dot';
            cell.appendChild(mark);
          }
        }
      }
    }

    /* ---------- 交互 ---------- */

    _onClick(e) {
      if (!this.interactive) return;
      if (this.pendingPromotion) return;   // 等用户选升变棋子

      const cell = e.target.closest('.cb-sq');
      if (!cell) return;
      const name = cell.dataset.sq;

      // 已选中 → 尝试走到这里
      if (this.selected) {
        if (name === this.selected) { this._clearSelection(); return; }

        if (this.dests.includes(name)) {
          this._tryMove(this.selected, name);
          return;
        }
        // 点到自己另一个子 → 改选它，比先取消再点更顺手
        const p = this.game.get(name);
        if (p && p.color === this.game.turn()) { this._select(name); return; }

        this._clearSelection();
        return;
      }

      const p = this.game.get(name);
      if (p && p.color === this.game.turn()) this._select(name);
    }

    _select(name) {
      this.selected = name;
      this.dests = PGN.Engine.destinations(this.game, name);
      this._render();
    }

    _clearSelection() {
      this.selected = null;
      this.dests = [];
      this._render();
    }

    /** 判断这步是否需要升变 */
    _needsPromotion(from, to) {
      const p = this.game.get(from);
      if (!p || p.type !== 'p') return false;
      const rank = to[1];
      return (p.color === 'w' && rank === '8') || (p.color === 'b' && rank === '1');
    }

    _tryMove(from, to) {
      if (this._needsPromotion(from, to)) {
        this._askPromotion(from, to);
        return;
      }
      this._commit(from, to, '');
    }

    _commit(from, to, promotion) {
      const mv = { from: from, to: to };
      if (promotion) mv.promotion = promotion;

      // 用副本试走，避免非法着法把主局面搞脏
      const probe = PGN.Engine.create(this.game.fen());
      const res = PGN.Engine.move(probe, mv);
      if (!res) { this._clearSelection(); return; }

      this.selected = null;
      this.dests = [];

      if (this.opts.onMove) {
        this.opts.onMove({
          san: res.san, from: res.from, to: res.to,
          promotion: res.promotion || '',
          fenBefore: this.game.fen(),
          fenAfter: probe.fen()
        });
      }
      // 由上层决定是否推进局面（棋谱树可能要挂新分支），
      // 这里不擅自改 this.game
    }

    /** 升变选择：在目标格附近弹出四个棋子 */
    _askPromotion(from, to) {
      const color = this.game.get(from).color;
      this.pendingPromotion = { from, to };

      this.promoEl.innerHTML = '';
      this.promoEl.style.display = 'flex';

      ['q', 'r', 'b', 'n'].forEach(t => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cb-promo-btn';
        const img = document.createElement('img');
        img.src = PIECE_DIR + color + t.toUpperCase() + '.svg';
        img.alt = t;
        b.appendChild(img);
        b.onclick = ev => {
          ev.stopPropagation();
          this.promoEl.style.display = 'none';
          const pend = this.pendingPromotion;
          this.pendingPromotion = null;
          this._commit(pend.from, pend.to, t);
        };
        this.promoEl.appendChild(b);
      });

      // 点浮层外面 = 取消升变
      const cancel = ev => {
        if (this.promoEl.contains(ev.target)) return;
        this.promoEl.style.display = 'none';
        this.pendingPromotion = null;
        this._clearSelection();
        document.removeEventListener('click', cancel, true);
      };
      setTimeout(() => document.addEventListener('click', cancel, true), 0);
    }
  }

  window.Board = Board;
})();
