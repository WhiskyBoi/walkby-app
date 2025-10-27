// Definiert einen Namen für den Cache
const CACHE_NAME = 'walkby-app-shell-v2';

// Liste der Dateien, die die "App Shell" bilden
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  // Füge hier weitere wichtige Assets hinzu, z.B. das Logo oder die Icon-Dateien
];

// Event 1: Installation
// Wird ausgelöst, wenn der Service Worker installiert wird.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell...');
        return cache.addAll(APP_SHELL_FILES);
      })
  );
});

// Event 2: Fetch (Netzwerkanfragen)
// Wird bei JEDER Anfrage (z.B. für CSS, JS, Bilder) ausgelöst.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Strategie "Cache-First" (für die App Shell):
    // 1. Versuche, die Anfrage aus dem Cache zu beantworten.
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // 1a. Im Cache gefunden -> direkt zurückgeben (schnell & offline)
          return response;
        }
        // 1b. Nicht im Cache -> zum Netzwerk gehen und anfragen
        return fetch(event.request);
      })
  );
});

// Event 3: Activate (Aufräumen)
// Wird ausgelöst, wenn ein neuer Service Worker einen alten ersetzt.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Aktivierung...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Lösche alle Caches, die nicht dem aktuellen CACHE_NAME entsprechen
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Alten Cache löschen:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});