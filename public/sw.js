// FocusLab Service Worker for Offline Support
const CACHE_NAME = "focuslab-v1"
const OFFLINE_URL = "/"

const ASSETS_TO_CACHE = ["/", "/manifest.json", "/icon-192.jpg", "/icon-512.jpg"]

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update cache in background
        event.waitUntil(
          fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, response.clone())
                })
              }
            })
            .catch(() => {
              // Network failed, but we have cache
            }),
        )
        return cachedResponse
      }

      // No cache, try network
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Network failed and no cache - return offline page for navigation
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL)
          }
          return new Response("Offline", { status: 503 })
        })
    }),
  )
})

// Background sync for habit data
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-habits") {
    event.waitUntil(syncHabits())
  }
})

async function syncHabits() {
  // Future: Sync habits with a backend when online
  console.log("Syncing habits...")
}

// Push notifications for habit reminders
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || "Time to check your habits!",
      icon: "/icon-192.jpg",
      badge: "/icon-192.jpg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        { action: "check", title: "Check Habits" },
        { action: "dismiss", title: "Dismiss" },
      ],
    }
    event.waitUntil(self.registration.showNotification(data.title || "FocusLab", options))
  }
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  if (event.action === "check") {
    event.waitUntil(clients.openWindow("/"))
  }
})
