// Alter Cache-Name für die Aufräum-Routine
const OLD_CACHE_NAME = 'walkby-app-shell-v2';
// Neuer Name, damit der SW merkt, dass er sich aktualisieren muss
const CACHE_NAME = 'walkby-app-shell-v3'; 

// Liste der Dateien, die die "App Shell" bilden
// manifest.json und das Logo für echtes Offline-Verhalten
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  '/manifest.json',
  '/anime-chibi.png' 
];

// Event 1: Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation v3...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell...');
        return cache.addAll(APP_SHELL_FILES);
      })
  );
});

// Event 2: Fetch (Netzwerkanfragen)
self.addEventListener('fetch', (event) => {
  
  // 1. Prüfen, ob die URL im APP_SHELL_FILES-Array enthalten ist; URL-Pfade abgleichen
  const requestUrl = new URL(event.request.url);
  const isAppShellUrl = APP_SHELL_FILES.includes(requestUrl.pathname) || 
                        APP_SHELL_FILES.includes(requestUrl.href);

  if (isAppShellUrl) {
    // 2. WENN es eine App-Shell-Datei ist -> "Cache-First"-Strategie
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response; // Aus dem Cache zurückgeben
          }
          // Nicht im Cache -> zum Netzwerk gehen
          return fetch(event.request);
        })
    );
  } else {
    // 3. WENN es KEINE App-Shell-Datei ist (z.B. API-Call an Supabase, Bilder-Uploads) -> "Network-Only"-Strategie, die Anfrage einfach ans Netzwerk weiter.   
    event.respondWith(fetch(event.request));
  }
});


// Event 3: Activate (Aufräumen)
// LÖSCHT JETZT DEN ALTEN CACHE 'walkby-app-shell-v2'
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Aktivierung v3...');
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