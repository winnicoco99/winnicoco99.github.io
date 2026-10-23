/* 离线优先：App 本体缓存，地图瓦片网络优先 */
const VER = 'nz-trip-v1';
const CORE = ['./', './index.html', './data.js', './manifest.json',
  './icon-180.png', './icon-192.png', './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 地图瓦片：网络优先，失败回落缓存
  if (/basemaps|tile|cartocdn/i.test(url.hostname)) {
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

  // 同源：缓存优先
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      const cp = r.clone();
      caches.open(VER).then(c => c.put(req, cp));
      return r;
    }).catch(() => caches.match('./index.html')))
  );
});
