// Simple fallback service worker for Android PWA Install Requirements
self.addEventListener("install", (event) => {
  console.log("KINO PWA Service Worker installed.");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("KINO PWA Service Worker activated.");
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Pass-through fetch (no offline caching implemented for MVP)
  event.respondWith(fetch(event.request));
});
