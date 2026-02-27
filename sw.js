const CACHE_NAME = 'bodega-chirinos-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/apple-icon.png',
]

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  self.clients.claim()
})

// Fetch Event - Network first, then cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip Firebase and external APIs
  if (
    url.pathname.includes('/__') ||
    url.pathname.includes('/api/') ||
    request.url.includes('firebase')
  ) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          return (
            response ||
            new Response('Offline - content not available', {
              status: 503,
              statusText: 'Service Unavailable',
            })
          )
        })
      })
  )
})

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions())
  }
})

async function syncTransactions() {
  try {
    const db = await openIndexedDB()
    const tx = db.transaction('transactions', 'readonly')
    const store = tx.objectStore('transactions')
    const pending = await getAllFromStore(store)

    for (const transaction of pending) {
      if (!transaction.synced) {
        await sendTransactionToServer(transaction)
        await markAsSynced(transaction.id)
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BodegaChirinos', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' })
      }
    }
  })
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function sendTransactionToServer(transaction) {
  // This will be called when sync completes
  // Server will process pending transactions
}

async function markAsSynced(transactionId) {
  const db = await openIndexedDB()
  const tx = db.transaction('transactions', 'readwrite')
  const store = tx.objectStore('transactions')

  const getRequest = store.get(transactionId)
  getRequest.onsuccess = () => {
    const transaction = getRequest.result
    transaction.synced = true
    store.put(transaction)
  }
}
