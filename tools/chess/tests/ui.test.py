"""
棋谱库界面测试。

先在 个人工作台/ 目录下起服务：
    python3 -m http.server 8799
再跑：
    python3 tools/chess/tests/ui.test.py

需要 playwright：
    pip install playwright && playwright install chromium

重点覆盖三件不能坏的事：
  1. 在已有着法上走不同的棋 → 新增分支，主变不变
  2. 「再下一盘」不能让已保存的棋局少一局
  3. 棋盘显示必须和引擎的真实局面一致（DOM 复用容易出残留）
"""

import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8799/tools/chess/"
results = []


def ok(name, cond, extra=""):
    results.append((name, bool(cond)))
    print(f"  {'✓' if cond else '✗'} {name}" + (f"  → {extra}" if not cond and extra else ""))


def play(pg, moves):
    """按 [(起点, 终点)] 走子"""
    for frm, to in moves:
        pg.click(f".cb-sq[data-sq='{frm}']")
        pg.click(f".cb-sq[data-sq='{to}']")
    pg.wait_for_timeout(120)


def board_map(pg):
    """棋盘上实际可见的棋子。棋子 DOM 会复用，所以要按计算样式判断可见性。"""
    return pg.evaluate("""() => {
        const out = {};
        document.querySelectorAll('.cb-sq').forEach(c => {
            const img = c.querySelector('.cb-piece');
            if (img && getComputedStyle(img).display !== 'none') {
                out[c.dataset.sq] = img.getAttribute('src').split('/').pop().replace('.svg','');
            }
        });
        return out;
    }""")


def engine_map(pg):
    """引擎认为的真实局面"""
    return pg.evaluate("""() => {
        const out = {};
        const b = board.game.board();
        const F = ['a','b','c','d','e','f','g','h'];
        for (let r=0;r<8;r++) for (let f=0;f<8;f++) {
            const p = b[r][f];
            if (p) out[F[f]+(8-r)] = p.color + p.type.toUpperCase();
        }
        return out;
    }""")


def fresh(b, seed=False):
    """干净页面。seed=True 时预置一局已保存的棋。"""
    pg = b.new_page(viewport={"width": 390, "height": 844})
    pg.goto(BASE, wait_until="networkidle")
    if seed:
        pg.evaluate("""() => {
            const g = PGN.parse('1. d4 d5 2. c4 e6');
            db.games = [{
                id: 'seed1', white: '甲', black: '乙', date: '2024-01-01',
                result: '*', event: '', tags: [], note: '',
                startFen: PGN.START_FEN, root: g.root, headers: {}, at: Date.now()
            }];
            persist(); renderGames();
        }""")
    return pg


LONG = """[White "K"]
[Black "T"]
[Result "1-0"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7
8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O
14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5
20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6
26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3
32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7
38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2
44. Qa7 1-0"""


def main():
    with sync_playwright() as sp:
        b = sp.chromium.launch()

        # ---------- 加载与渲染 ----------
        print("\n[1] 加载与棋盘渲染")
        pg = fresh(b)
        errs, bad404 = [], []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("response", lambda r: bad404.append(r.url) if r.status >= 400 else None)
        pg.reload(wait_until="networkidle")

        ok("引擎加载", pg.evaluate("() => typeof Chess") == "function")
        ok("64 格", pg.locator(".cb-sq").count() == 64)
        ok("开局 32 子", len(board_map(pg)) == 32, len(board_map(pg)))
        ok("e1 白王", board_map(pg).get("e1") == "wK")
        ok("d8 黑后", board_map(pg).get("d8") == "bQ")
        ok("盘面与引擎一致", board_map(pg) == engine_map(pg))
        pg.close()

        # ---------- 走子 ----------
        print("\n[2] 点选走子")
        pg = fresh(b)
        pg.click(".cb-sq[data-sq='e2']")
        vis_marks = pg.evaluate("""() => [...document.querySelectorAll('.cb-dot,.cb-cap')]
            .filter(e => getComputedStyle(e).display !== 'none').length""")
        ok("e2 显示 2 个落点", vis_marks == 2, vis_marks)
        pg.click(".cb-sq[data-sq='e4']")
        pg.wait_for_timeout(150)
        ok("e4 落子", board_map(pg).get("e4") == "wP")
        ok("e2 空了", "e2" not in board_map(pg))
        ok("盘面正确", board_map(pg) == engine_map(pg))
        ok("列表有 e4", "e4" in pg.locator("#moves").inner_text())
        ok("状态显示未保存", "未保存" in pg.locator("#status").inner_text())

        print("\n[3] 点非行棋方的子不给选")
        n = pg.evaluate("""() => [...document.querySelectorAll('.cb-dot,.cb-cap')]
            .filter(e => getComputedStyle(e).display !== 'none').length""")
        pg.click(".cb-sq[data-sq='e4']")   # 白兵，但现在轮黑
        n2 = pg.evaluate("""() => [...document.querySelectorAll('.cb-dot,.cb-cap')]
            .filter(e => getComputedStyle(e).display !== 'none').length""")
        ok("无落点提示", n2 == 0, n2)
        pg.close()

        # ---------- 变招（核心） ----------
        print("\n[4] 走不同的棋要开分支，主变不能变")
        pg = fresh(b)
        play(pg, [("e2", "e4"), ("e7", "e5"), ("g1", "f3"), ("b8", "c6")])
        ok("主变 4 着", pg.evaluate("() => PGN.countMainline(cur.root)") == 4)

        pg.click("#nav-prev")
        pg.click("#nav-prev")
        ok("退回第 2 手", pg.evaluate("() => PGN.pathTo(cur.root, cur.nodeId).length") == 2)
        play(pg, [("f1", "c4")])          # 走 Bc4 而不是 Nf3
        info = pg.evaluate("""() => {
            const e5 = cur.root.children[0].children[0];
            return {kids: e5.children.map(c => c.san),
                    main: PGN.countMainline(cur.root),
                    all: PGN.countAll(cur.root)};
        }""")
        ok("★ 分出两条线", len(info["kids"]) == 2, info["kids"])
        ok("★ 主变仍是 Nf3", info["kids"][0] == "Nf3", info["kids"])
        ok("★ Bc4 成为变招", info["kids"][1] == "Bc4", info["kids"])
        ok("★ 主变没被覆盖", info["main"] == 4, info)
        ok("总着法 5", info["all"] == 5, info)
        ok("界面有变招缩进块", pg.locator(".varline").count() >= 1)

        print("\n[5] 走已存在的着法只跳转，不重复建分支")
        pg.click("#nav-start")
        play(pg, [("e2", "e4")])
        ok("总着法仍 5", pg.evaluate("() => PGN.countAll(cur.root)") == 5,
           pg.evaluate("() => PGN.countAll(cur.root)"))

        print("\n[6] 升为主变")
        pg.evaluate("""() => {
            const e5 = cur.root.children[0].children[0];
            cur.nodeId = e5.children[1].id; syncBoard();
        }""")
        pg.click("#act-promote")
        kids = pg.evaluate("() => cur.root.children[0].children[0].children.map(c => c.san)")
        ok("变招升为主变", kids[0] == "Bc4", kids)
        ok("已是主变时按钮禁用", pg.locator("#act-promote").is_disabled())
        pg.close()

        # ---------- 显示正确性 ----------
        print("\n[7] 长棋谱来回翻，棋盘不能出残留")
        pg = fresh(b)
        pg.on("dialog", lambda d: d.accept())
        pg.fill("#pgn-in", LONG)
        pg.click("#act-load")
        pg.wait_for_timeout(700)
        ok("读到 87 手", pg.evaluate("() => PGN.countMainline(cur.root)") == 87)

        pg.click("#nav-end")
        pg.wait_for_timeout(250)
        ok("末局盘面正确", board_map(pg) == engine_map(pg))
        pg.click("#nav-start")
        pg.wait_for_timeout(250)
        ok("回开局 32 子", len(board_map(pg)) == 32, len(board_map(pg)))

        wrong = []
        for i in range(25):
            pg.click("#nav-next")
            pg.wait_for_timeout(35)
            if board_map(pg) != engine_map(pg):
                wrong.append(i + 1)
        ok("★ 前进 25 手每步正确", not wrong, f"第 {wrong} 手错")

        wrong = []
        for i in range(25):
            pg.click("#nav-prev")
            pg.wait_for_timeout(35)
            if board_map(pg) != engine_map(pg):
                wrong.append(i + 1)
        ok("★ 后退 25 手每步正确", not wrong, f"第 {wrong} 步错")

        print("\n[8] 翻转棋盘")
        pg.click("#nav-end")
        pg.wait_for_timeout(250)
        before = board_map(pg)
        pg.click("#nav-flip")
        pg.wait_for_timeout(250)
        ok("★ 翻转后棋子位置不变", before == board_map(pg),
           f"{len(before)} → {len(board_map(pg))}")
        ok("翻转后与引擎一致", board_map(pg) == engine_map(pg))
        ok("左上角变 h1",
           pg.locator(".cb-grid .cb-sq").first.get_attribute("data-sq") == "h1")
        pg.click("#nav-flip")
        pg.wait_for_timeout(250)
        ok("翻回来仍正确", board_map(pg) == engine_map(pg))
        pg.close()

        print("\n[9] 吃子 / 王车易位 / 升变")
        pg = fresh(b)
        pg.on("dialog", lambda d: d.accept())
        play(pg, [("e2", "e4"), ("d7", "d5"), ("e4", "d5")])
        m = board_map(pg)
        ok("吃子后 d5 是白兵", m.get("d5") == "wP", m.get("d5"))
        ok("★ 吃子后总数 31（无残留）", len(m) == 31, len(m))
        ok("吃子后盘面正确", m == engine_map(pg))

        pg.click("#act-new")
        pg.wait_for_timeout(200)
        pg.fill("#pgn-in", "1. e4 e5 2. Nf3 Nf6 3. Bc4 Bc5 4. O-O O-O *")
        pg.click("#act-load")
        pg.wait_for_timeout(500)
        pg.click("#nav-end")
        pg.wait_for_timeout(250)
        m = board_map(pg)
        ok("白王易位到 g1", m.get("g1") == "wK", m.get("g1"))
        ok("白车到 f1", m.get("f1") == "wR", m.get("f1"))
        ok("易位后盘面正确", m == engine_map(pg))

        pg.click("#act-new")
        pg.wait_for_timeout(200)
        pg.evaluate("""() => {
            cur.id = null; cur.startFen = '4k3/P7/8/8/8/8/8/4K3 w - - 0 1';
            cur.root = PGN.newRoot(); cur.nodeId = 'root'; syncBoard();
        }""")
        pg.click(".cb-sq[data-sq='a7']")
        pg.click(".cb-sq[data-sq='a8']")
        pg.wait_for_timeout(200)
        ok("升变弹窗出现", pg.locator(".cb-promo").is_visible())
        ok("4 个选项", pg.locator(".cb-promo-btn").count() == 4)
        pg.locator(".cb-promo-btn").first.click()
        pg.wait_for_timeout(250)
        ok("升变成后", board_map(pg).get("a8") == "wQ", board_map(pg).get("a8"))
        ok("升变后盘面正确", board_map(pg) == engine_map(pg))
        pg.close()

        # ---------- PGN 导入 ----------
        print("\n[10] 粘贴 PGN 自动带入信息")
        pg = fresh(b)
        pg.on("dialog", lambda d: d.accept())
        pg.fill("#pgn-in", """[Event "Test Match"]
[Date "2024.05.20"]
[White "Kasparov, Garry"]
[Black "Karpov, Anatoly"]
[Result "1-0"]
[ECO "C42"]

1. e4 e5 2. Nf3 Nf6 3. Nxe5 (3. d4 exd4 4. e5) d6 4. Nf3 Nxe4 1-0""")
        pg.click("#act-load")
        pg.wait_for_timeout(500)
        ok("白方带入", pg.input_value("#f-white") == "Kasparov, Garry")
        ok("黑方带入", pg.input_value("#f-black") == "Karpov, Anatoly")
        ok("日期带入", pg.input_value("#f-date") == "2024-05-20")
        ok("结果带入", pg.input_value("#f-result") == "1-0")
        ok("ECO 进标签", "C42" in pg.input_value("#f-tag"))
        info = pg.evaluate("() => ({m: PGN.countMainline(cur.root), a: PGN.countAll(cur.root)})")
        ok("主变 8 着", info["m"] == 8, info)
        ok("★ 变招保留（总 11）", info["a"] == 11, info)
        pg.close()

        # ---------- 保存与「再下一盘」 ----------
        print("\n[11] 保存 → 回执 → 再下一盘不动已存的")
        pg = fresh(b)
        pg.on("dialog", lambda d: d.accept())
        play(pg, [("e2", "e4"), ("e7", "e5"), ("g1", "f3")])
        pg.fill("#f-white", "我")
        pg.fill("#f-black", "老王")
        pg.click("#act-save")
        pg.wait_for_timeout(350)
        ok("回执出现", pg.locator("#saved-tip").is_visible())
        ok("回执指路再下一盘", "再下一盘" in pg.locator("#saved-tip").inner_text())
        ok("状态变已保存", "已保存" in pg.locator("#status").inner_text())
        ok("存了 1 局", pg.evaluate("() => db.games.length") == 1)

        pg.click("#act-new")
        pg.wait_for_timeout(350)
        ok("棋盘清空", pg.evaluate("() => PGN.countAll(cur.root)") == 0)
        ok("★★ 已存棋局一局没少", pg.evaluate("() => db.games.length") == 1,
           pg.evaluate("() => db.games.length"))
        ok("★★ 存的内容完整", pg.evaluate("""() => {
            const g = JSON.parse(localStorage.getItem('workbench.chess')).games[0];
            return g.white === '我' && g.black === '老王' && PGN.countAll(g.root) === 3;
        }"""))
        ok("表单清空", pg.input_value("#f-white") == "")

        play(pg, [("d2", "d4"), ("d7", "d5")])
        pg.fill("#f-black", "小李")
        pg.click("#act-save")
        pg.wait_for_timeout(350)
        ok("★★ 变成 2 局", pg.evaluate("() => db.games.length") == 2,
           pg.evaluate("() => db.games.length"))
        pg.close()

        # ---------- 防丢棋 ----------
        print("\n[12] 没保存的棋不会被无声覆盖")
        pg = fresh(b, seed=True)
        play(pg, [("e2", "e4"), ("e7", "e5"), ("g1", "f3")])
        ok("处于未保存状态", pg.evaluate("() => isDirty()") is True)

        seen = []
        pg.once("dialog", lambda d: (seen.append(d.message), d.dismiss()))
        pg.locator("#game-list .gmain").first.click()
        pg.wait_for_timeout(350)
        ok("切换前会问", len(seen) == 1, seen)
        ok("★ 取消后棋还在", pg.evaluate("() => PGN.countAll(cur.root)") == 3)
        ok("取消后没切走", pg.evaluate("() => cur.id") is None)

        pg.once("dialog", lambda d: d.accept())
        pg.locator("#game-list .gmain").first.click()
        pg.wait_for_timeout(350)
        ok("确定后切过去", pg.evaluate("() => cur.id") == "seed1")
        pg.close()

        print("\n[13] 已保存的局走子自动写回，不新增记录")
        pg = fresh(b, seed=True)
        pg.locator("#game-list .gmain").first.click()
        pg.wait_for_timeout(300)
        pg.click("#nav-end")
        pg.wait_for_timeout(120)
        before = pg.evaluate("() => PGN.countAll(cur.root)")
        play(pg, [("b1", "c3")])
        ok("走子生效", pg.evaluate("() => PGN.countAll(cur.root)") == before + 1)
        ok("仍算已保存", pg.evaluate("() => isDirty()") is False)
        ok("★ 仍是 1 局", pg.evaluate("() => db.games.length") == 1)
        ok("写回了 localStorage", pg.evaluate("""() => {
            const g = JSON.parse(localStorage.getItem('workbench.chess')).games[0];
            return PGN.countAll(g.root);
        }""") == before + 1)
        pg.close()

        # ---------- 导出 ----------
        print("\n[14] 单局导出 / 整库导出")
        pg = fresh(b)
        pg.on("dialog", lambda d: d.accept())
        pg.fill("#pgn-in", '[White "甲"]\n[Black "乙"]\n[Date "2024.05.01"]\n\n1. e4 e5 2. Nf3 (2. Bc4 Bc5) Nc6 *')
        pg.click("#act-import-save")
        pg.wait_for_timeout(400)
        pg.fill("#pgn-in", '[White "丙"]\n[Black "丁"]\n\n1. d4 d5 *')
        pg.click("#act-import-save")
        pg.wait_for_timeout(400)
        ok("库里 2 局", pg.evaluate("() => db.games.length") == 2)

        idx = pg.evaluate("""() => [...document.querySelectorAll('#game-list li')]
            .findIndex(li => li.innerText.includes('甲'))""")
        with pg.expect_download() as dl:
            pg.locator("#game-list li").nth(idx).locator(".iconbtn[title*='导出']").click()
        one = open(dl.value.path(), encoding="utf-8").read()
        ok("单局导出只含 1 局", one.count("[White ") == 1, one.count("[White "))
        ok("导的是甲乙那局", "甲" in one and "丙" not in one)
        ok("变招保留在导出里", "Bc4" in one)
        ok("文件名含双方", "甲" in dl.value.suggested_filename,
           dl.value.suggested_filename)

        with pg.expect_download() as dl2:
            pg.click("#act-export-pgn")
        allp = open(dl2.value.path(), encoding="utf-8").read()
        ok("整库导出含 2 局", allp.count("[White ") == 2, allp.count("[White "))
        pg.close()

        # ---------- 移动端 ----------
        print("\n[15] 小屏布局")
        pg = b.new_page(viewport={"width": 360, "height": 780})
        pg.goto(BASE, wait_until="networkidle")
        box = pg.locator(".cb-grid").bounding_box()
        ok("棋盘不溢出", box["width"] <= 360, box["width"])
        ok("棋盘是正方形", abs(box["width"] - box["height"]) < 2)
        ok("棋盘够大", box["width"] > 280, box["width"])
        pg.close()

        print("\n[16] 无错误")
        ok("无 JS 错误", not errs, errs[:2])
        ok("无 404", not bad404, bad404[:3])

        b.close()


main()
passed = sum(1 for _, c in results if c)
print("\n" + "=" * 48)
print(f"通过 {passed} / 失败 {len(results) - passed}")
if len(results) - passed:
    print("\n失败项：")
    for n, c in results:
        if not c:
            print("  ✗ " + n)
print("=" * 48)
sys.exit(0 if passed == len(results) else 1)
