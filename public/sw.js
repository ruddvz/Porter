/* Porter seller dashboard — offline shell + Plan0-style fetch routing */
const CACHE = "porter-seller-v3";
const STATIC_EXT = /\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(["/dashboard", "/offline", "/manifest.json"]).catch(() => undefined)
      )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // APIs — network only (Plan0)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Built chunks + static files — cache-first (Plan0-style assets)
  if (url.pathname.startsWith("/_next/static/") || STATIC_EXT.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const copy = res.clone();
          if (res.ok) {
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  const accept = request.headers.get("accept") ?? "";
  const isHtmlNavigation =
    request.mode === "navigate" || (request.method === "GET" && accept.includes("text/html"));

  // HTML — network-first; avoid caching navigations (mixed sessions on shared devices)
  if (isHtmlNavigation) {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline"))
        )
    );
    return;
  }

  event.respondWith(fetch(request));
});

self.addEventListener("push", (event) => {
  let data = { title: "Porter", body: "", url: "/dashboard/orders" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      data: { url: data.url || "/dashboard/orders" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard/orders";
  event.waitUntil(self.clients.openWindow(url));
});
