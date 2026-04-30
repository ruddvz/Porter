/* Porter service worker — paths derived from registration scope (GitHub Pages–safe). */
const CACHE = "porter-shell-v1";

function scopeRoot() {
  const u = new URL(self.registration.scope);
  let p = u.pathname;
  if (!p.endsWith("/")) p += "/";
  return p;
}

function precacheUrls() {
  const root = scopeRoot();
  const origin = self.location.origin;
  return [
    origin + root,
    origin + root + "manifest.webmanifest",
    origin + root + "icon-192.png",
    origin + root + "icon-512.png",
  ];
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(precacheUrls()))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request)
        .then((res) => {
          const copy = res.clone();
          if (res.ok && res.type === "basic") {
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(new URL(scopeRoot(), self.location.origin).href));
    })
  );
});
