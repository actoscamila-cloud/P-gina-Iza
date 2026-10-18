const CACHE_NAME = 'roones-pwa-v11';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon.svg',
  '/logo.png',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching assets warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW: Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. DO NOT intercept cross-origin requests (Firebase, Google APIs, etc.)
  if (url.origin !== self.location.origin) return;

  // 2. DO NOT intercept API calls
  if (url.pathname.startsWith('/api/')) return;

  // 3. DO NOT intercept Vite development modules / hot reloads
  if (url.pathname.includes('/@') || url.pathname.includes('node_modules')) return;

  // 4. Navigation requests (HTML page loading) -> ALWAYS Network-First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // If network succeeded, optionally update cache for offline fallback
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          // If network completely failed (offline), attempt to serve cached page or fallback
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return caches.match('/').then((rootCached) => {
              if (rootCached) return rootCached;
              return new Response(
                '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vertus Offline</title><style>body{background:#0F0F0F;color:#D4AF37;font-family:sans-serif;text-align:center;padding:40px 20px;}button{background:#D4AF37;color:#0F0F0F;border:none;padding:12px 24px;border-radius:12px;font-weight:bold;margin-top:20px;cursor:pointer;}</style></head><body><h2>Sem Conexão</h2><p>Verifique sua internet e tente novamente.</p><button onclick="window.location.reload()">Tentar Novamente</button></body></html>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              );
            });
          });
        })
    );
    return;
  }

  // 5. Static assets (images, icons, fonts, CSS, JS chunks) -> Network-First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // CRITICAL: Never return undefined to respondWith!
        return new Response('', { status: 408, statusText: 'Request timed out or offline' });
      })
  );
});
