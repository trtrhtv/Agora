// Service worker: cache the whole library so it can be read offline.
// Pages: network first (fresh content when online), cache as fallback.
// Static assets: cache first.
const VERSION = 'agora-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      const res = await fetch('/offline-pages.json', { cache: 'no-store' });
      const pages = await res.json();
      // Add pages one by one so a single failure doesn't abort the install.
      await Promise.all(pages.map((p) => cache.add(p).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== VERSION) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const isPage = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      if (isPage) {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return (await cache.match(request)) || (await cache.match('/')) || Response.error();
        }
      }
      const cached = await cache.match(request);
      if (cached) return cached;
      const fresh = await fetch(request);
      if (fresh.ok) cache.put(request, fresh.clone());
      return fresh;
    })(),
  );
});
