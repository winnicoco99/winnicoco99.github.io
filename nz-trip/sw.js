/* 离线可用 + 行程更新立刻生效 */
const VER = 'nz-trip-v3';
const CORE = ['./', './index.html', './data.js', './manifest.json',
  './icon-180.png', './icon-192.png', './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(
      ks.filter(k => k !== VER && k !== VER + '-tiles').map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

/* 页面点「更新」时立刻接管，不用等旧标签页全关 */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* 地图瓦片：网络优先，看过的缓存下来（断网也能显示） */
  if (/basemaps|tile|cartocdn|arcgisonline/i.test(url.hostname)) {
    e.respondWith(
      fetch(req).then(r => {
        const cp = r.clone();
        caches.open(VER + '-tiles').then(c => c.put(req, cp));
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }

  if (url.origin !== location.origin) return;

  /* 页面本体：网络优先 —— 行程一推送就拿到新的，断网时回落缓存 */
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req).then(r => {
        const cp = r.clone();
        caches.open(VER).then(c => c.put('./index.html', cp));
        return r;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  /* 其余静态资源 + 本地瓦片：缓存优先，后台补新 */
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      const cp = r.clone();
      caches.open(VER).then(c => c.put(req, cp));
      return r;
    }))
  );
});
