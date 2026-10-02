/* Tonga service worker. Template: vite.config.ts injects VERSION and PRECACHE at build time.
 * - App shell: precached per version; old versions are deleted on activate.
 * - catalog.json and page loads: network first, cache as offline fallback.
 * - repositorios/ (thousands of images): cached on demand, at most MAX_COLLECTION entries.
 * A new version waits until the page asks it to take over (no silent reloads). */
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const SHELL = `tonga-shell-${VERSION}`;
const COLLECTIONS = 'tonga-collections';
const MAX_COLLECTION = 300;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tonga-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = (await cache.match(request)) ?? (request.mode === 'navigate' ? await caches.match('./index.html', { ignoreSearch: true }) : undefined);
    if (cached) return cached;
    throw err;
  }
}

async function collectionImage(request) {
  const cache = await caches.open(COLLECTIONS);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    for (const old of keys.slice(0, Math.max(0, keys.length - MAX_COLLECTION))) await cache.delete(old);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  const path = url.pathname.slice(scope.pathname.length);
  if (request.mode === 'navigate' || path === 'catalog.json') event.respondWith(networkFirst(request, SHELL));
  else if (path.startsWith('repositorios/')) event.respondWith(collectionImage(request));
  else event.respondWith(caches.match(request, { ignoreSearch: true }).then((hit) => hit ?? fetch(request)));
});
