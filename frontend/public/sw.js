// Minimal service worker: makes the site installable. It deliberately caches
// nothing, so students never see stale marks or an old version of the app.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
