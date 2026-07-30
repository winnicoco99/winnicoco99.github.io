# 第三方代码说明

这个目录和 `../pieces/` 里的文件都来自开源项目，本地保存一份是为了
离线可用（不走 CDN），没有做任何功能修改。

## chess.js v1.4.0

- 用途：国际象棋规则引擎（判断着法合法性、生成 SAN、输出 FEN、判定将杀和棋）
- 作者：Jeff Hlywa
- 许可：BSD-2-Clause
- 来源：https://github.com/jhlywa/chess.js

唯一的改动是在文件头尾加了一层 UMD 包装，让原本的 CommonJS 构建能
在浏览器里用 `<script>` 直接引入。引擎逻辑本身一行没动。

## cburnett 棋子（../pieces/*.svg）

- 用途：棋盘上的棋子图形，也就是 lichess 的默认棋子
- 作者：Colin M.L. Burnett
- 许可：GPL-2.0-or-later（也可按 CC BY-SA 3.0 使用）
- 来源：https://github.com/lichess-org/lila/tree/master/public/piece/cburnett

12 个 SVG 原样保存，未修改。
