import { getDatabaseInstance } from './firebase'
import { ref, get, set, update, push, query, orderByChild, limitToLast, onValue } from 'firebase/database'
import { ExchangeRate, Product, Transaction, InventoryTransaction, DashboardStats } from './types'

// Exchange Rate Functions
export async function getExchangeRate(): Promise<ExchangeRate | null> {
  const database = getDatabaseInstance()
  try {
    const snapshot = await get(ref(database, 'exchangeRates/current'))
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error('Failed to get exchange rate:', error)
    return null
  }
}

export async function setExchangeRate(rate: number, userId: string, notes?: string): Promise<ExchangeRate> {
  const database = getDatabaseInstance()
  const now = Date.now()
  
  const exchangeRate: ExchangeRate = {
    id: 'current',
    rateUsdToBs: rate,
    lastUpdatedBy: userId,
    lastUpdatedAt: now,
    notes,
  }

  try {
    await set(ref(database, 'exchangeRates/current'), exchangeRate)
    return exchangeRate
  } catch (error: any) {
    throw new Error(`Failed to update exchange rate: ${error.message}`)
  }
}

// Product Functions
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Product> {
  const database = getDatabaseInstance()
  const newRef = push(ref(database, 'products'))
  const now = Date.now()

  const newProduct: Product = {
    ...product,
    id: newRef.key!,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  }

  try {
    await set(newRef, newProduct)
    return newProduct
  } catch (error: any) {
    throw new Error(`Failed to create product: ${error.message}`)
  }
}

export async function getProduct(productId: string): Promise<Product | null> {
  const database = getDatabaseInstance()
  try {
    const snapshot = await get(ref(database, `products/${productId}`))
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error('Failed to get product:', error)
    return null
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const database = getDatabaseInstance()
  try {
    const snapshot = await get(ref(database, 'products'))
    if (!snapshot.exists()) return []
    
    const products: Product[] = []
    snapshot.forEach((child) => {
      products.push(child.val())
    })
    return products
  } catch (error) {
    console.error('Failed to get products:', error)
    return []
  }
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
  const database = getDatabaseInstance()
  try {
    await update(ref(database, `products/${productId}`), {
      ...updates,
      updatedAt: Date.now(),
    })
    
    const snapshot = await get(ref(database, `products/${productId}`))
    return snapshot.val() as Product
  } catch (error: any) {
    throw new Error(`Failed to update product: ${error.message}`)
  }
}

export async function updateProductStock(productId: string, quantity: number): Promise<Product> {
  const database = getDatabaseInstance()
  try {
    const product = await getProduct(productId)
    if (!product) throw new Error('Product not found')

    const newStock = Math.max(0, product.stock + quantity)
    await update(ref(database, `products/${productId}`), {
      stock: newStock,
      updatedAt: Date.now(),
    })

    const snapshot = await get(ref(database, `products/${productId}`))
    return snapshot.val() as Product
  } catch (error: any) {
    throw new Error(`Failed to update stock: ${error.message}`)
  }
}

// Transaction Functions
export async function createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>, userId: string): Promise<Transaction> {
  const database = getDatabaseInstance()
  const newRef = push(ref(database, 'transactions'))

  const newTransaction: Transaction = {
    ...transaction,
    id: newRef.key!,
    createdAt: Date.now(),
    createdBy: userId,
  }

  try {
    await set(newRef, newTransaction)
    
    // Update product stocks
    for (const item of transaction.cartItems) {
      await updateProductStock(item.productId, -item.quantity)
    }

    return newTransaction
  } catch (error: any) {
    throw new Error(`Failed to create transaction: ${error.message}`)
  }
}

export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const database = getDatabaseInstance()
  try {
    const snapshot = await get(ref(database, `transactions/${transactionId}`))
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error('Failed to get transaction:', error)
    return null
  }
}

export async function getRecentTransactions(limit: number = 50): Promise<Transaction[]> {
  const database = getDatabaseInstance()
  try {
    const q = query(ref(database, 'transactions'), orderByChild('createdAt'), limitToLast(limit))
    const snapshot = await get(q)
    
    if (!snapshot.exists()) return []

    const transactions: Transaction[] = []
    snapshot.forEach((child) => {
      transactions.push(child.val())
    })
    return transactions.reverse()
  } catch (error) {
    console.error('Failed to get transactions:', error)
    return []
  }
}

// Inventory Transaction Functions
export async function createInventoryTransaction(
  transaction: Omit<InventoryTransaction, 'id' | 'createdAt' | 'createdBy'>,
  userId: string
): Promise<InventoryTransaction> {
  const database = getDatabaseInstance()
  const newRef = push(ref(database, 'inventoryTransactions'))

  const newTransaction: InventoryTransaction = {
    ...transaction,
    id: newRef.key!,
    createdAt: Date.now(),
    createdBy: userId,
  }

  try {
    await set(newRef, newTransaction)
    
    // Update product stock
    const multiplier = transaction.type === 'OUT' ? -1 : 1
    await updateProductStock(transaction.productId, newTransaction.quantity * multiplier)

    return newTransaction
  } catch (error: any) {
    throw new Error(`Failed to create inventory transaction: ${error.message}`)
  }
}

export async function getInventoryTransactions(productId: string): Promise<InventoryTransaction[]> {
  const database = getDatabaseInstance()
  try {
    const snapshot = await get(ref(database, 'inventoryTransactions'))
    if (!snapshot.exists()) return []

    const transactions: InventoryTransaction[] = []
    snapshot.forEach((child) => {
      const tx = child.val()
      if (tx.productId === productId) {
        transactions.push(tx)
      }
    })
    return transactions.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('Failed to get inventory transactions:', error)
    return []
  }
}

// Real-time Exchange Rate Listener
export function onExchangeRateChange(
  callback: (rate: ExchangeRate) => void,
  errorCallback?: (error: Error) => void
): () => void {
  const database = getDatabaseInstance()
  
  const unsubscribe = onValue(
    ref(database, 'exchangeRates/current'),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const rate: ExchangeRate = {
          id: data.id || 'current',
          rate: data.rateUsdToBs || data.rate,
          lastUpdated: data.lastUpdatedAt || data.updatedAt || Date.now(),
          lastUpdatedBy: data.lastUpdatedBy,
          notes: data.notes,
        }
        callback(rate)
      }
    },
    (error) => {
      if (errorCallback) errorCallback(error)
    }
  )

  return unsubscribe
}

// Update Exchange Rate
export async function updateExchangeRate(rate: number): Promise<void> {
  const database = getDatabaseInstance()
  const now = Date.now()
  
  try {
    await set(ref(database, 'exchangeRates/current'), {
      rateUsdToBs: rate,
      rate: rate,
      lastUpdatedAt: now,
      updatedAt: now,
    })
  } catch (error: any) {
    throw new Error(`Failed to update exchange rate: ${error.message}`)
  }
}

// Get Dashboard Statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const database = getDatabaseInstance()
  
  try {
    const now = Date.now()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartMs = todayStart.getTime()

    // Get transactions
    const transactionsSnapshot = await get(ref(database, 'transactions'))
    let transactions: Transaction[] = []
    let todayRevenue = 0
    let todayTransactions = 0

    if (transactionsSnapshot.exists()) {
      transactionsSnapshot.forEach((child) => {
        const tx = child.val()
        transactions.push({ id: child.key!, ...tx })
        
        if (tx.createdAt >= todayStartMs) {
          todayRevenue += tx.totalAmount || 0
          todayTransactions++
        }
      })
    }

    // Get inventory
    const inventorySnapshot = await get(ref(database, 'products'))
    let totalItems = 0
    let lowStockItems = 0
    let totalProfitMargin = 0
    let productCount = 0

    if (inventorySnapshot.exists()) {
      inventorySnapshot.forEach((child) => {
        const product = child.val()
        if (product.quantity !== undefined) {
          totalItems += product.quantity
        }
        if (product.quantity < (product.minStockLevel || 5)) {
          lowStockItems++
        }
        if (product.profitMargin !== undefined) {
          totalProfitMargin += product.profitMargin
          productCount++
        }
      })
    }

    return {
      todayRevenue,
      todayTransactions,
      totalTransactions: transactions.length,
      totalItems,
      lowStockItems,
      profitMargin: productCount > 0 ? totalProfitMargin / productCount : 0,
    }
  } catch (error) {
    console.error('Failed to get dashboard stats:', error)
    return {
      todayRevenue: 0,
      todayTransactions: 0,
      totalTransactions: 0,
      totalItems: 0,
      lowStockItems: 0,
      profitMargin: 0,
    }
  }
}

// Get Recent Transactions
export async function getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
  const database = getDatabaseInstance()
  
  try {
    const snapshot = await get(ref(database, 'transactions'))
    const transactions: Transaction[] = []
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        transactions.push({
          id: child.key!,
          ...child.val()
        })
      })
    }

    return transactions
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limit)
  } catch (error) {
    console.error('Failed to get recent transactions:', error)
    return []
  }
}

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  const database = getDatabaseInstance()
  try {
    const snapshot = await get(ref(database, 'products'))
    const products: Product[] = []
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        products.push({
          id: child.key!,
          ...child.val()
        })
      })
    }

    return products
  } catch (error) {
    console.error('Failed to get products:', error)
    return []
  }
}

// Create transaction
export async function createTransaction(
  transactionData: Omit<Transaction, 'id' | 'createdAt'>,
  userId: string
): Promise<Transaction> {
  const database = getDatabaseInstance()
  const newRef = push(ref(database, 'transactions'))
  const now = Date.now()

  const transaction: Transaction = {
    ...transactionData,
    id: newRef.key!,
    createdAt: now,
  }

  try {
    await set(newRef, transaction)
    
    // Deduct inventory for each item
    for (const item of transactionData.items) {
      const productRef = ref(database, `products/${item.productId}`)
      const snapshot = await get(productRef)
      
      if (snapshot.exists()) {
        const product = snapshot.val()
        const newQuantity = (product.quantity || 0) - item.quantity
        
        await update(productRef, {
          quantity: newQuantity,
          updatedAt: now,
        })
      }
    }

    return transaction
  } catch (error: any) {
    throw new Error(`Failed to create transaction: ${error.message}`)
  }
}

// Update product
export async function updateProduct(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  const database = getDatabaseInstance()
  
  try {
    await update(ref(database, `products/${productId}`), updates)
  } catch (error: any) {
    throw new Error(`Failed to update product: ${error.message}`)
  }
}
