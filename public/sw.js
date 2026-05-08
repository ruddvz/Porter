/* Porter seller dashboard — minimal offline shell */
const CACHE = "porter-seller-v2";

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
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((c) => c || fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      }))
    );
    return;
  }

  const accept = event.request.headers.get("accept") ?? "";
  const isHtmlNavigation =
    event.request.mode === "navigate" || (event.request.method === "GET" && accept.includes("text/html"));

  event.respondWith(
    fetch(event.request)
      .then((res) => res)
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (isHtmlNavigation) return caches.match("/offline");
          return caches.match("/dashboard");
        })
      )
  );
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
