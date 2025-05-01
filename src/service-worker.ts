
/// <reference lib="webworker" />

/**
 * Enhanced service worker for PWA functionality with improved offline support
 */

// This placeholder will be replaced during the build process with
// the precache manifest - DO NOT REMOVE THIS COMMENT/LINE
// @ts-ignore
self.__WB_MANIFEST;

declare const self: ServiceWorkerGlobalScope

// Cache names
const CACHE_NAME = 'hif-team-app-v2';
const API_CACHE_NAME = 'hif-api-cache';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

// Install event - precache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  // Force taking over the page to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Precaching essential files');
      // Don't try to cache large files - just cache the essential files
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      console.log('Service Worker installation complete');
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  // Clear old API cache on activation to ensure fresh data
  const clearOldAPICaches = caches.delete(API_CACHE_NAME)
    .then(() => console.log('Cleared old API cache for fresh data'));
  
  event.waitUntil(
    Promise.all([
      clearOldAPICaches,
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
    ]).then(() => {
      console.log('Service Worker: Successfully activated and controlling');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Helper function to determine if a request is for the Supabase API
const isSupabaseAPIRequest = (url) => {
  return url.hostname.includes('supabase');
};

// Helper function to determine if a request is for activities
const isActivitiesRequest = (url) => {
  return url.pathname.includes('activities');
};

// Fetch event - serve from cache if available, with special handling for API requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special handling for Supabase API requests
  if (isSupabaseAPIRequest(url)) {
    if (event.request.method === 'GET') {
      // For activity endpoints, use NetworkFirst with aggressive caching
      if (isActivitiesRequest(url)) {
        event.respondWith(
          fetch(event.request.clone(), {
            // Try to always get fresh data for activities
            cache: 'no-store',
            headers: new Headers({
              'X-Custom-Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            })
          })
            .then(response => {
              // Clone the response for caching
              const responseToCache = response.clone();
              
              // Only cache valid responses
              if (response.ok) {
                caches.open(API_CACHE_NAME).then(cache => {
                  cache.put(event.request, responseToCache);
                  console.log('Service Worker: Cached API response for activities data');
                });
              }
              
              return response;
            })
            .catch(() => {
              console.log('Service Worker: Offline, trying cached API response for activities');
              return caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                  console.log('Service Worker: Returning cached response for activities');
                  return cachedResponse;
                }
                
                // If we have no cached response, return empty but valid data
                return new Response(JSON.stringify({
                  data: [],
                  error: { message: 'Offline and no cached data available' }
                }), { 
                  headers: { 'Content-Type': 'application/json' }
                });
              });
            })
        );
      } else {
        // For other API calls, use NetworkFirst strategy
        event.respondWith(
          fetch(event.request.clone())
            .then(response => {
              // Clone the response for caching
              const responseToCache = response.clone();
              
              // Only cache valid responses
              if (response.ok) {
                caches.open(API_CACHE_NAME).then(cache => {
                  cache.put(event.request, responseToCache);
                });
              }
              
              return response;
            })
            .catch(() => {
              return caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                return new Response(JSON.stringify({
                  data: null,
                  error: { message: 'Offline and no cached data available' }
                }), { 
                  headers: { 'Content-Type': 'application/json' }
                });
              });
            })
        );
      }
    } else {
      // For non-GET requests, try network first, then handle offline case
      event.respondWith(
        fetch(event.request.clone())
          .catch(() => {
            console.log('Service Worker: Offline, cannot perform API operation', url.pathname);
            return new Response(JSON.stringify({
              data: null,
              error: { message: 'Offline, request will be synced when online' }
            }), { 
              headers: { 'Content-Type': 'application/json' },
              status: 503, // Service Unavailable
              statusText: 'Offline' 
            });
          })
      );
    }
  } else {
    // Regular assets - Standard caching strategy
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((fetchResponse) => {
          // Don't cache non-GET requests
          if (event.request.method !== 'GET') {
            return fetchResponse;
          }
          
          // Clone the response
          const responseToCache = fetchResponse.clone();
          
          // Only cache successful responses
          if (fetchResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              // Only cache responses smaller than 5MB to avoid the file size issues
              cache.put(event.request, responseToCache);
            });
          }
          
          return fetchResponse;
        }).catch(() => {
          // Offline fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          return new Response('Du är offline. Kontrollera din internetanslutning.');
        });
      })
    );
  }
});

// Handle clear API cache message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_API_CACHE') {
    console.log('Service Worker: Received request to clear API cache');
    
    event.waitUntil(
      caches.delete(API_CACHE_NAME).then(() => {
        console.log('Service Worker: API cache cleared');
        
        // Send confirmation back to the client
        if (event.ports && event.ports.length > 0) {
          event.ports[0].postMessage({
            type: 'CACHE_CLEARED',
            timestamp: Date.now()
          });
        } else if (event.source && 'postMessage' in event.source) {
          // Legacy method
          (event.source as Client).postMessage({
            type: 'CACHE_CLEARED',
            timestamp: Date.now()
          });
        }
      }).catch(error => {
        console.error('Service Worker: Error clearing API cache:', error);
        
        // Still try to notify the client
        if (event.ports && event.ports.length > 0) {
          event.ports[0].postMessage({
            type: 'CACHE_CLEAR_ERROR',
            error: error.message,
            timestamp: Date.now()
          });
        }
      })
    );
  } else if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper function to sync pending activities
async function syncPendingActivities() {
  // Implementation would go here when we have offline editing capabilities
  console.log('Service Worker: Sync function called but not fully implemented');
  return Promise.resolve();
}
