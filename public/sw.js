const CACHE_PREFIX = "stash-snap-";
const CACHE_NAME = `${CACHE_PREFIX}v2`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Network-first for navigations and API/Supabase calls, so a returning tab
// always gets the current index.html and never serves a stale build after a
// new deployment. Cache-first only for hashed /assets/ files, which are safe
// to cache forever since a new deploy always ships new filenames.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) {
    return;
  }

  if (request.mode === "navigate" || url.pathname === "/index.html") {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              event.waitUntil(
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
              );
            }
            return response;
          })
      )
    );
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
