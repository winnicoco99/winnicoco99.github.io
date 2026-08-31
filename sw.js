/* Service Worker：让工作台在没网时也能打开
   ------------------------------------------------------------
   策略：网络优先，成功就顺手更新缓存；失败回落到缓存。
   这样既不会看到过期页面，断网时也还能用。
   改了文件后如果手机上还是旧的，把下面版本号 +1 再 push。

   ⛔ 2026-08-31 修的坑：光靠 fetch() 拿不到新文件。

   GitHub Pages 给所有文件发 `Cache-Control: max-age=600`。
   sw 里的 `fetch(request)` 默认**会走浏览器 HTTP 缓存**，所以部署后
   10 分钟内 sw 拿到的「网络响应」其实是磁盘上的旧副本，还带着 200 OK，
   于是被当成新鲜内容存进新版缓存 —— 缓存名换成 v13 了，里面装的还是
   v12 的内容。表现就是「怎么刷都刷不出新工具」。

   所以：**会变的文件（html/js/css/json）必须显式绕过 HTTP 缓存**，
   见 needsRevalidate() 和 install 里的 `cache:'reload'`。
   光把 VERSION +1 解决不了这个问题。
*/
const VERSION = 'v14';
const CACHE = 'workbench-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './theme.css',
  './tools.js',
  './storage.js',
  './manifest.json',
  './icons/icon-192.png',
  './tools/rhythm/',
  './tools/rhythm/index.html',
  './tools/rhythm/app.js',
  './tools/library/',
  './tools/library/index.html',
  './tools/library/app.js',
  './tools/library/db.js',
  './tools/library/vendor/html5-qrcode.min.js',
  './tools/notes/',
  './tools/notes/index.html',
  './tools/shelf/',
  './tools/shelf/index.html',
  './tools/shelf/app.js',
  './tools/chess/',
  './tools/chess/index.html',
  './tools/chess/app.js',
  './tools/chess/board.js',
  './tools/chess/pgn.js',
  './tools/chess/vendor/chess.js',
  './tools/chess/pieces/wK.svg',
  './tools/chess/pieces/wQ.svg',
  './tools/chess/pieces/wR.svg',
  './tools/chess/pieces/wB.svg',
  './tools/chess/pieces/wN.svg',
  './tools/chess/pieces/wP.svg',
  './tools/chess/pieces/bK.svg',
  './tools/chess/pieces/bQ.svg',
  './tools/chess/pieces/bR.svg',
  './tools/chess/pieces/bB.svg',
  './tools/chess/pieces/bN.svg',
  './tools/chess/pieces/bP.svg'
];

/* 哪些请求必须回服务器核对新鲜度。
   代码和页面会改，图标棋子这些一旦发布就不动，
   所以只对前者付验证的代价（带 ETag，没变就是个 304，很轻）。 */
const CODE_FILE = /\.(?:html|js|css|json)$/i;

function needsRevalidate(request) {
  let url;
  try { url = new URL(request.url); } catch { return false; }
  if (url.origin !== self.location.origin) return false;   // 第三方资源不管
  if (request.mode === 'navigate') return true;            // 页面跳转
  if (url.pathname.endsWith('/')) return true;             // 目录索引就是 html
  return CODE_FILE.test(url.pathname);
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // cache:'reload' = 无视 HTTP 缓存直接回源。
      // 不加这个，预缓存装进来的就是上一版的文件。
      // 单个文件 404 不该让整次安装失败，所以逐个 add。
      .then(c => Promise.allSettled(
        PRECACHE.map(u => c.add(new Request(u, { cache: 'reload' })))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // no-cache 是「必须问服务器」，不是「不缓存」——
  // 服务器答 304 时浏览器仍复用本地副本，所以代价很小。
  const req = needsRevalidate(e.request)
    ? new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
    : e.request;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          // 存的时候用原始 request 当 key，否则后面 match 不上
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
