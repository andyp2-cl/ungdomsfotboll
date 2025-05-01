
// @ts-ignore
self.__WB_MANIFEST;

// Service worker code
const cacheName = 'hassleholmsif-cache-v1';

// Cache all the app's essential assets during install
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  // @ts-ignore
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        // Add other essential assets here
      ]);
    })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  // @ts-ignore
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Network-first strategy for fetch requests
self.addEventListener('fetch', (event) => {
  // @ts-ignore
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response as it can only be consumed once
        const responseClone = response.clone();
        
        // Open the cache and store the new response
        caches.open(cacheName).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // If network fetch fails, try to return the cached response
        return caches.match(event.request);
      })
  );
});
