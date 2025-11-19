const CACHE_NAME = 'mobil-torzsadat-v1';
const PRECACHE_URLS = [
  './',                 // kezdőlap
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// Telepítés – shell cache-elése
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Aktiválás – régi cache-ek törlése
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch – saját fájlokra cache-first, minden más (Firebase, ZXing) hálózatról
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Csak a /mobil/ origin + path alatt cache-elünk
  if (url.origin === self.location.origin && url.pathname.startsWith('/mobil/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request);
      })
    );
  }
});
