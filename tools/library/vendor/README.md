# 第三方资源说明

## html5-qrcode.min.js

- 版本：2.3.8
- 来源：https://github.com/mebjas/html5-qrcode
- 许可：Apache License 2.0
- 用途：调用摄像头识别书籍背面的 **EAN-13 条形码**（也就是 ISBN）

存本地而不用 CDN，是为了两件事：

1. **离线可用** —— 加进 sw.js 的 PRECACHE，没网也能扫码
2. **不受 CDN 波动影响** —— jsDelivr 在国内偶发不稳

体积 375KB，是这个工作台里最大的单个文件。它内含 ZXing 的 JS 移植，
条形码解码本身就需要这些码表和图像处理代码，没有更小的可靠替代。

### 升级方式

```bash
curl -o html5-qrcode.min.js \
  https://cdn.jsdelivr.net/npm/html5-qrcode@<新版本>/html5-qrcode.min.js
```

升级后必须实测扫一本真书，且把 sw.js 的 VERSION +1。

---

## 关于书目数据来源

书目信息来自豆瓣图书接口（`api.douban.com/v2/book/isbn/`），
**通过 JSONP 调用**，所以不需要 CORS 代理。

已实测的注意点：

- 命中率约八成。冷门书、太新的书、以及港台原版书可能查不到，
  所以手动录入必须始终可用，不能把扫码当唯一入口。
- **封面图取不到。** 豆瓣图片是 referer 白名单机制：
  带 `book.douban.com` 的 referer 返 200，空 referer 返 418。
  浏览器不允许网页伪造 referer，图片代理（weserv 等）也一样被拒。
  所以封面只支持「自己上传一张」，其余情况用书名首字做排版封面。
- 这是非官方开放的接口，随时可能变。真变了也不影响已存的数据，
  只是新书要手动录入。
