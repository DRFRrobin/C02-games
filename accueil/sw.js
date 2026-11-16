// Cache minimal : la page d'accueil fonctionne aussi hors ligne une fois ouverte.
const CACHE = 'c02-accueil-v1';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Réseau d'abord (toujours la dernière version), cache en secours.
  e.respondWith(
    fetch(e.request).then((rep) => {
      const copie = rep.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copie));
      return rep;
    }).catch(() => caches.match(e.request))
  );
});
