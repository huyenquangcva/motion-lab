/* Physics Motion Lab - service worker: lưu sẵn toàn bộ ứng dụng để dùng offline.
 * Đổi CACHE khi phát hành bản mới để thiết bị tải lại tệp. */
const CACHE = 'pml-v2';
const FILES = [
  './', 'index.html', 'style.css', 'manifest.json',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'src/utils/math.js', 'src/calibration/calibration.js', 'src/physics/kinematics.js', 'src/physics/assistant.js',
  'src/tracking/tracking.js', 'src/tracking/runner.js', 'src/video/video.js', 'src/charts/plot.js',
  'src/export/exporter.js', 'src/storage/storage.js',
  'src/app/core.js', 'src/app/stage.js', 'src/app/panels.js', 'src/app/report.js', 'src/app/selftest.js', 'src/app/gate.js', 'src/app/main.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) {
        // làm mới nền (stale-while-revalidate) để lần mở sau có bản mới nhất
        fetch(req).then((r) => { if (r && r.ok) caches.open(CACHE).then((c) => c.put(req, r)); }).catch(() => {});
        return hit;
      }
      return fetch(req).then((r) => { if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return r; })
        .catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    })
  );
});
