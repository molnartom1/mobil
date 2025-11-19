const CACHE_NAME = 'mobil-torzsadat-v2';

const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// Telepítés – alap fájlok cache-elése
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

// Fetch – index.html-re NETWORK-FIRST, minden másra CACHE-FIRST
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Csak a /mobil/ alatt foglalkozunk vele
  if (url.origin === self.location.origin && url.pathname.startsWith('/mobil/')) {

    // Navigációs kérések (app shell: index.html)
    if (
      event.request.mode === 'navigate' ||
      url.pathname === '/mobil/' ||
      url.pathname.endsWith('/mobil/index.html')
    ) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // frisset betesszük a cache-be
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return response;
          })
          .catch(() => caches.match(event.request))
      );
      return;
    }

    // Egyéb statikus fájlok – cache-first
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});
