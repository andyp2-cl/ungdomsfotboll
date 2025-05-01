
/// <reference lib="webworker" />

/**
 * Service worker for PWA functionality
 */

// This placeholder will be replaced during the build process with
// the precache manifest - DO NOT REMOVE THIS COMMENT/LINE
// @ts-ignore
self.__WB_MANIFEST;

declare const self: ServiceWorkerGlobalScope

// Cache names
const CACHE_NAME = 'hif-team-app-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

// Install event - precache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't try to cache large files - just cache the essential files
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        // Don't cache API requests or non-GET requests
        if (!event.request.url.includes('/api/') && event.request.method === 'GET') {
          return caches.open(CACHE_NAME).then((cache) => {
            // Only cache responses smaller than 5MB to avoid the file size issues
            if (fetchResponse.headers.get('content-length') && 
                parseInt(fetchResponse.headers.get('content-length') || '0', 10) < 5000000) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Offline fallback
        return new Response('Du är offline. Kontrollera din internetanslutning.');
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
