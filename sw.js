const CACHE_NAME = 'quizspark-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/quiz.html',
  '/leaderboard.html',
  '/css/style.css',
  '/css/quiz.css',
  '/js/main.js',
  '/js/quiz.js',
  '/js/leaderboard.js',
  '/js/utils.js',
  '/data/questions.json',
  '/assets/images/favicon.ico'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache assets during install:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip caching for non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Special handling for questions.json
  if (event.request.url.endsWith('questions.json')) {
    event.respondWith(handleQuestionsJson(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream that can only be consumed once
        const fetchRequest = event.request.clone();
        
        // Try to fetch from network
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a stream that can only be consumed once
          const responseToCache = response.clone();
          
          // Cache the fetched response for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(error => {
              console.warn('Failed to cache response:', error);
            });
            
          return response;
        })
        .catch(error => {
          console.warn('Network fetch failed:', error);
          throw error;
        });
      })
      .catch(error => {
        console.warn('Cache match failed:', error);
        // Try network as fallback
        return fetch(event.request)
          .catch(networkError => {
            console.error('Both cache and network failed:', networkError);
            throw networkError;
          });
      })
  );
});

// Special handler for questions.json to ensure it's always fresh
async function handleQuestionsJson(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the fresh response
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME)
        .then(cache => cache.put(request, responseToCache))
        .catch(error => console.warn('Failed to cache questions.json:', error));
      return networkResponse;
    }
  } catch (networkError) {
    console.warn('Network fetch for questions.json failed:', networkError);
  }
  
  // Fall back to cache
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  } catch (cacheError) {
    console.warn('Cache lookup for questions.json failed:', cacheError);
  }
  
  // If both fail, return a minimal valid response
  return new Response('{}', {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});