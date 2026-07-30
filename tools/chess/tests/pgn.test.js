/* ============================================================
   PGN 解析 / 导出测试（不需要浏览器）
   ------------------------------------------------------------
   在 个人工作台/ 目录下跑：
     node tools/chess/tests/pgn.test.js

   重点是变招：解析时要挂到正确位置，导出后再解析结构必须一致。
   ============================================================ */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..');

// vendor/chess.js 是 UMD，挂到 self 上
global.self = global;
new Function('self', fs.readFileSync(path.join(DIR, 'vendor/chess.js'), 'utf8'))(global);
global.window = global;
eval(fs.readFileSync(path.join(DIR, 'pgn.js'), 'utf8'));

let pass = 0, fail = 0;
const failed = [];

function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else {
    fail++; failed.push(name);
    console.log('  ✗ ' + name + (extra ? '  → ' + extra : ''));
  }
}

/** 主变的 SAN 序列 */
const mainline = root => {
  const out = [];
  let c = root;
  while (c.children && c.children.length) { c = c.children[0]; out.push(c.san); }
  return out.join(' ');
};

/** 结构指纹：递归拼 san + 批注 + 注释 + 子树，用于 round-trip 比对 */
function fingerprint(node) {
  const kids = (node.children || []).map(fingerprint);
  const self = node.san
    + ((node.nags && node.nags.length) ? node.nags.join('') : '')
    + (node.comment ? '{' + node.comment + '}' : '');
  return kids.length ? self + '[' + kids.join(',') + ']' : self;
}

/** 解析 → 导出 → 再解析，结构必须一致 */
function roundTrip(src, label) {
  const g1 = PGN.parse(src);
  const out = PGN.build({
    headers: { Result: g1.headers.Result || '*' },
    startFen: g1.startFen,
    root: g1.root
  });
  const g2 = PGN.parse(out);
  const f1 = fingerprint(g1.root), f2 = fingerprint(g2.root);
  ok(label + ' round-trip 结构一致', f1 === f2,
     f1 === f2 ? '' : '\n      原=' + f1 + '\n      新=' + f2);
  ok(label + ' 无解析错误', g2.errors.length === 0, JSON.stringify(g2.errors));
  return { g1, g2, out };
}

console.log('\n[1] 基础解析');
{
  const g = PGN.parse('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0');
  ok('主变正确', mainline(g.root) === 'e4 e5 Nf3 Nc6 Bb5 a6', mainline(g.root));
  ok('无错误', g.errors.length === 0);
  ok('着法数 6', g.moveCount === 6, g.moveCount);
}

console.log('\n[2] 头部标签');
{
  const g = PGN.parse(`[Event "Test Cup"]
[White "Carlsen, Magnus"]
[Black "Nakamura, Hikaru"]
[Result "1-0"]
[WhiteElo "2850"]
[Date "2024.03.15"]
[ECO "C42"]

1. d4 d5 1-0`);
  ok('White', g.headers.White === 'Carlsen, Magnus', g.headers.White);
  ok('Black', g.headers.Black === 'Nakamura, Hikaru');
  ok('Elo', g.headers.WhiteElo === '2850');
  ok('Date', g.headers.Date === '2024.03.15');
  ok('ECO', g.headers.ECO === 'C42');
}

console.log('\n[3] 变招挂载位置（核心）');
{
  // 2. Bc4 替代的是 2. Nf3，所以它是 Nf3 的兄弟，不是子节点
  const g = PGN.parse('1. e4 e5 2. Nf3 (2. Bc4 Bc5) Nc6');
  const e5 = g.root.children[0].children[0];
  ok('e5 下 2 个分支', e5.children.length === 2, e5.children.length);
  ok('主变是 Nf3', e5.children[0].san === 'Nf3', e5.children[0].san);
  ok('变招是 Bc4', e5.children[1].san === 'Bc4', e5.children[1].san);
  ok('Bc5 挂在 Bc4 下', e5.children[1].children[0].san === 'Bc5');
  ok('主变没被污染', mainline(g.root) === 'e4 e5 Nf3 Nc6', mainline(g.root));
  ok('检测到变招', PGN.hasVariations(g.root) === true);
  roundTrip('1. e4 e5 2. Nf3 (2. Bc4 Bc5) Nc6', '单变招');
}

console.log('\n[4] 嵌套变招');
{
  const src = '1. e4 e5 2. Nf3 (2. Bc4 Bc5 (2... Nf6 3. d3) 3. Qh5) Nc6 3. Bb5';
  const r = roundTrip(src, '嵌套');
  const e5 = r.g2.root.children[0].children[0];
  const bc4 = e5.children[1];
  ok('Bc4 在位', bc4 && bc4.san === 'Bc4');
  ok('Bc5 有兄弟 Nf6', bc4.children.length === 2 && bc4.children[1].san === 'Nf6',
     JSON.stringify(bc4.children.map(c => c.san)));
  ok('主变完整', mainline(r.g2.root) === 'e4 e5 Nf3 Nc6 Bb5', mainline(r.g2.root));
}

console.log('\n[5] 开局即变招 / 多个平行变招');
{
  const r = roundTrip('1. e4 (1. d4 d5) (1. Nf3 Nf6) e5', '开局三选一');
  ok('根有 3 个分支', r.g2.root.children.length === 3,
     r.g2.root.children.map(c => c.san));
  ok('顺序保持', r.g2.root.children.map(c => c.san).join(',') === 'e4,d4,Nf3',
     r.g2.root.children.map(c => c.san).join(','));
}
{
  const r = roundTrip('1. e4 e5 2. Nf3 (2. Bc4) (2. f4) (2. Nc3) Nc6', '四选一');
  const e5 = r.g2.root.children[0].children[0];
  ok('4 个分支', e5.children.length === 4, e5.children.length);
  ok('顺序保持', e5.children.map(c => c.san).join(',') === 'Nf3,Bc4,f4,Nc3',
     e5.children.map(c => c.san).join(','));
}

console.log('\n[6] 注释与批注');
{
  const g = PGN.parse('1. e4 {好棋} e5 2. Nf3! {发展} Nc6?! 3. Bb5 $14');
  const e4 = g.root.children[0];
  ok('e4 注释', e4.comment === '好棋', e4.comment);
  const nf3 = e4.children[0].children[0];
  ok('Nf3 带 !', nf3.nags.includes('!'), JSON.stringify(nf3.nags));
  ok('SAN 干净（不含 !）', nf3.san === 'Nf3', nf3.san);
  ok('Nc6 带 ?!', nf3.children[0].nags.includes('?!'));
  ok('Bb5 带 $14', nf3.children[0].children[0].nags.includes('$14'));
  roundTrip('1. e4 e5 2. Nf3! {好} (2. Bc4?! {冒险} Bc5 $14) Nc6', '变招带批注');
}

console.log('\n[7] 王车易位 / 升变 / 将杀 / 自定义 FEN');
{
  const g = PGN.parse('1. e4 e5 2. Nf3 Nf6 3. Bc4 Bc5 4. O-O O-O');
  ok('O-O 解析', mainline(g.root).includes('O-O'), mainline(g.root));
  ok('无错误', g.errors.length === 0);
}
{
  const g = PGN.parse('[FEN "8/P7/8/8/8/8/8/K6k w - - 0 1"]\n\n1. a8=Q+ Kh2');
  ok('升变 a8=Q+', g.root.children[0].san === 'a8=Q+', g.root.children[0].san);
  ok('自定义 FEN 生效', g.startFen === '8/P7/8/8/8/8/8/K6k w - - 0 1');
}
{
  const g = PGN.parse('1. f3 e5 2. g4 Qh4#');
  ok('将杀 Qh4#', mainline(g.root) === 'f3 e5 g4 Qh4#', mainline(g.root));
  const out = PGN.build({ headers: { Result: '0-1' }, startFen: PGN.START_FEN, root: g.root });
  ok('# 保留在导出', out.includes('Qh4#'));
}
{
  const src = '[SetUp "1"]\n[FEN "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"]\n\n4. O-O (4. Nc3 Nf6) Bc5';
  const g1 = PGN.parse(src);
  const out = PGN.build({ headers: { Result: '*' }, startFen: g1.startFen, root: g1.root });
  const g2 = PGN.parse(out);
  ok('FEN 写进导出', out.includes('[FEN "r1bqkbnr'));
  ok('自定义 FEN + 变招结构一致', fingerprint(g1.root) === fingerprint(g2.root));
  ok('回合号从 4 起', out.includes('4. O-O'));
}

console.log('\n[8] 黑方变招要补回合号');
{
  const r = roundTrip('1. e4 e5 2. Nf3 Nc6 (2... Nf6 3. Nxe5) 3. Bb5', '黑方变招');
  ok('导出含 2... Nf6', r.out.includes('2... Nf6'), r.out.split('\n\n')[1]);
}

console.log('\n[9] 真实 lichess 棋谱');
{
  const real = `[Event "Rated Blitz game"]
[Site "https://lichess.org/abcd1234"]
[Date "2024.06.01"]
[White "player_one"]
[Black "player_two"]
[Result "0-1"]
[ECO "B01"]
[Opening "Scandinavian Defense"]

1. e4 { [%clk 0:05:00] } d5 { [%clk 0:05:00] } 2. exd5 { [%clk 0:04:58] } Qxd5 { [%clk 0:04:57] } 3. Nc3 { [%clk 0:04:56] } Qa5 { [%clk 0:04:55] } 0-1`;
  const g = PGN.parse(real);
  ok('ECO', g.headers.ECO === 'B01');
  ok('Opening', g.headers.Opening === 'Scandinavian Defense');
  ok('6 手', g.moveCount === 6, g.moveCount);
  ok('时钟注释保留', g.root.children[0].comment.includes('%clk'));
  ok('无错误', g.errors.length === 0);
}

console.log('\n[10] 树操作');
{
  const g = PGN.parse('1. e4 e5 2. Nf3 (2. Bc4 Bc5) Nc6');
  const e5 = g.root.children[0].children[0];
  const bc4 = e5.children[1].id;
  PGN.promote(g.root, bc4);
  ok('变招升主变', e5.children[0].san === 'Bc4', e5.children[0].san);
  ok('新主变线路', mainline(g.root) === 'e4 e5 Bc4 Bc5', mainline(g.root));
  PGN.remove(g.root, bc4);
  ok('删除后剩 Nf3', e5.children.length === 1 && e5.children[0].san === 'Nf3',
     JSON.stringify(e5.children.map(c => c.san)));
}
{
  const g = PGN.parse('1. e4 e5 2. Nf3 (2. Bc4 Bc5) Nc6');
  const e5 = g.root.children[0].children[0];
  const bc5 = e5.children[1].children[0];
  const p = PGN.pathTo(g.root, bc5.id);
  ok('变招路径', p.map(n => n.san).join(' ') === 'e4 e5 Bc4 Bc5',
     p.map(n => n.san).join(' '));
}

console.log('\n[11] 多局分割');
{
  const two = `[White "A"]
[Result "1-0"]

1. e4 e5 1-0

[White "C"]
[Result "0-1"]

1. d4 d5 0-1`;
  const games = PGN.splitGames(two);
  ok('切成 2 局', games.length === 2, games.length);
  if (games.length === 2) {
    ok('第一局 A', PGN.parse(games[0]).headers.White === 'A');
    ok('第二局 C', PGN.parse(games[1]).headers.White === 'C');
  }
}

console.log('\n[12] 容错');
{
  const g = PGN.parse('1. e4 e5 2. Zz9 Nf3 Nc6');
  ok('记下非法着法', g.errors.length > 0, JSON.stringify(g.errors));
  ok('合法部分仍解析', mainline(g.root).startsWith('e4 e5'), mainline(g.root));
}
ok('无回合号能解析', PGN.parse('e4 e5 Nf3 Nc6').moveCount === 4);
ok('紧凑写法能解析', PGN.parse('1.e4 e5 2.Nf3 Nc6').moveCount === 4);
ok('和棋标记不当着法', PGN.parse('1. e4 e5 1/2-1/2').moveCount === 2);
ok('未闭合注释不死循环', PGN.parse('1. e4 e5 { 没关').moveCount === 2);
ok('未闭合括号不崩', PGN.parse('1. e4 e5 (2. Bc4').moveCount === 2);
{
  const g = PGN.parse('[White "A"]\n[Result "*"]\n\n*');
  ok('空局不报错', g.root.children.length === 0);
  const out = PGN.build({ headers: g.headers, startFen: g.startFen, root: g.root });
  ok('空局能导出', out.includes('[White "A"]'));
}

console.log('\n[13] FEN 与回合号推算');
{
  const g = PGN.parse('1. e4');
  ok('e4 后 FEN 正确',
     g.root.children[0].fen.startsWith('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b'),
     g.root.children[0].fen);
  const m = PGN.moveMeta(g.root.children[0].fen);
  ok('识别为白方第 1 回合', m.color === 'w' && m.num === 1, JSON.stringify(m));
}
{
  const g = PGN.parse('1. e4 e5');
  const m = PGN.moveMeta(g.root.children[0].children[0].fen);
  ok('识别为黑方第 1 回合', m.color === 'b' && m.num === 1, JSON.stringify(m));
}

console.log('\n[14] 性能（真实名局 87 手）');
{
  const real = `1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7
8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O
14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5
20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6
26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3
32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7
38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2
44. Qa7 1-0`;
  const t0 = Date.now();
  const g1 = PGN.parse(real);
  const out = PGN.build({ headers: { Result: '1-0' }, startFen: PGN.START_FEN, root: g1.root });
  const g2 = PGN.parse(out);
  const ms = Date.now() - t0;
  ok('87 手全解析', g1.moveCount === 87, g1.moveCount);
  ok('无错误', g1.errors.length === 0, JSON.stringify(g1.errors));
  ok('round-trip 一致', mainline(g1.root) === mainline(g2.root));
  ok(`单局 round-trip < 150ms（实测 ${ms}ms）`, ms < 150, ms + 'ms');

  const t1 = Date.now();
  for (let i = 0; i < 20; i++) PGN.parse(real);
  const ms20 = Date.now() - t1;
  ok(`20 局导入 < 1500ms（实测 ${ms20}ms）`, ms20 < 1500, ms20 + 'ms');
}
{
  // 深主变不能栈溢出（导出用循环而非递归）
  const g = new Chess();
  const sans = [];
  for (let i = 0; i < 300; i++) {
    const ms = g.moves();
    if (!ms.length) break;
    const m = ms[i % ms.length];
    g.move(m); sans.push(m);
  }
  let src = '', num = 1;
  for (let i = 0; i < sans.length; i++) {
    if (i % 2 === 0) src += num++ + '. ';
    src += sans[i] + ' ';
  }
  const g1 = PGN.parse(src);
  ok(sans.length + ' ply 深主变不崩', g1.moveCount === sans.length, g1.moveCount);
  const out = PGN.build({ headers: {}, startFen: PGN.START_FEN, root: g1.root });
  ok('深主变能导出', PGN.parse(out).moveCount === sans.length);
}

console.log('\n' + '='.repeat(48));
console.log(`通过 ${pass} / 失败 ${fail}`);
if (fail) {
  console.log('\n失败项：');
  failed.forEach(n => console.log('  ✗ ' + n));
}
console.log('='.repeat(48));
process.exit(fail ? 1 : 0);
