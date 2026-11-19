const CACHE_NAME = "finquest-shell-v2";
const APP_SHELL = ["/manifest.webmanifest", "/assets/identidad/icono_app_finquest.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

// Red primero para datos financieros en vivo; nunca servimos cifras desde caché.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((res) => res || caches.match("/manifest.webmanifest")))
  );
});
