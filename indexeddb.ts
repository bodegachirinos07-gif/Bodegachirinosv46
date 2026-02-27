const DB_NAME = 'BodegaChirinos'
const DB_VERSION = 1

let db: IDBDatabase | null = null

export interface OfflineTransaction {
  id: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  subtotalUsd: number
  exchangeRate: number
  paymentMethod: string
  amountReceivedUsd?: number
  amountReceivedBs?: number
  changeUsd?: number
  changeBs?: number
  notes?: string
  synced: boolean
  timestamp: number
}

export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create object stores
      if (!database.objectStoreNames.contains('transactions')) {
        database.createObjectStore('transactions', { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains('exchangeRate')) {
        database.createObjectStore('exchangeRate', { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains('products')) {
        database.createObjectStore('products', { keyPath: 'id' })
      }
    }
  })
}

export async function saveTransaction(transaction: OfflineTransaction): Promise<void> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('transactions', 'readwrite')
    const store = tx.objectStore('transactions')
    const request = store.add(transaction)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getPendingTransactions(): Promise<OfflineTransaction[]> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('transactions', 'readonly')
    const store = tx.objectStore('transactions')
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const transactions = request.result as OfflineTransaction[]
      resolve(transactions.filter(t => !t.synced))
    }
  })
}

export async function markTransactionAsSynced(transactionId: string): Promise<void> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('transactions', 'readwrite')
    const store = tx.objectStore('transactions')
    const getRequest = store.get(transactionId)

    getRequest.onsuccess = () => {
      const transaction = getRequest.result
      transaction.synced = true
      const updateRequest = store.put(transaction)

      updateRequest.onerror = () => reject(updateRequest.error)
      updateRequest.onsuccess = () => resolve()
    }

    getRequest.onerror = () => reject(getRequest.error)
  })
}

export async function saveExchangeRate(rate: number): Promise<void> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('exchangeRate', 'readwrite')
    const store = tx.objectStore('exchangeRate')
    const request = store.put({
      id: 'current',
      rate,
      timestamp: Date.now(),
    })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getExchangeRateOffline(): Promise<number | null> {
  const database = await initializeDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('exchangeRate', 'readonly')
    const store = tx.objectStore('exchangeRate')
    const request = store.get('current')

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const result = request.result
      resolve(result ? result.rate : null)
    }
  })
}

export async function clearDatabase(): Promise<void> {
  const database = await initializeDB()
  const stores = ['transactions', 'exchangeRate', 'products']

  for (const storeName of stores) {
    if (database.objectStoreNames.contains(storeName)) {
      await new Promise<void>((resolve, reject) => {
        const tx = database.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        const request = store.clear()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    }
  }
}
