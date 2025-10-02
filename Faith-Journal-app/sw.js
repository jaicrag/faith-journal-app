const CACHE_NAME = 'faith-journal-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// Import Babel Standalone script. This makes the `Babel` object available.
self.importScripts('https://unpkg.com/@babel/standalone/babel.min.js');

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('ServiceWorker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('ServiceWorker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // If the request is for a .ts or .tsx file, transpile it with Babel.
  if (url.origin === self.origin && /\.(tsx|ts)$/.test(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) {
            return response;
          }
          return response.text().then(sourceCode => {
            const transpiled = Babel.transform(sourceCode, {
              presets: ['react', 'typescript'],
              filename: url.pathname, // for better error messages
            }).code;

            return new Response(transpiled, {
              headers: { 'Content-Type': 'application/javascript' }
            });
          });
        })
        .catch(error => {
            console.error('ServiceWorker: Error transpiling', url.pathname, error);
            return new Response(`Error transpiling ${url.pathname}: ${error}`, { status: 500 });
        })
    );
  } else {
    // For all other requests, use a cache-first then network strategy.
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response; // Return from cache
          }
          // Not in cache, fetch from network
          return fetch(event.request).then(networkResponse => {
            // Optionally, you can cache other dynamic assets here
            // but for this app, we primarily care about the app shell and transpiled files.
            return networkResponse;
          });
        })
    );
  }
});
