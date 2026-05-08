const CACHE_NAME = "porter-v1";
const STATIC_ASSETS = ["/", "/dashboard", "/offline"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) => c.addAll(STATIC_ASSETS).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    e.respondWith(
      caches.match(request).then((r) =>
        r ||
          fetch(request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            return res;
          }),
      ),
    );
    return;
  }

  e.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        return res;
      })
      .catch(() =>
        caches.match(request).then((r) => r || caches.match("/offline")),
      ),
  );
});

self.addEventListener("push", (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title ?? "Porter", {
      body: data.body ?? "You have a new notification",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      data: { url: data.url ?? "/dashboard/orders" },
      actions: [
        { action: "view", title: "View Order" },
        { action: "dismiss", title: "Dismiss" },
      ],
      vibrate: [100, 50, 100],
      tag: data.tag ?? "porter-notification",
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "dismiss") return;
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      const target = e.notification.data?.url ?? "/dashboard";
      const existing = cs.find((c) => c.url.includes(target));
      if (existing) return existing.focus();
      return clients.openWindow(target);
    }),
  );
});
