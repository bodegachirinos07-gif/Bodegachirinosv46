import { z } from 'zod'

// User Roles
export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier',
  INVENTORY_MANAGER = 'inventory_manager',
}

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  createdAt: z.number(),
  lastLogin: z.number().nullable(),
  isActive: z.boolean().default(true),
})

export type User = z.infer<typeof UserSchema>

// Exchange Rate Schema
export const ExchangeRateSchema = z.object({
  id: z.string().default('current'),
  rate: z.number().positive('Exchange rate must be positive'),
  rateUsdToBs: z.number().positive('Exchange rate must be positive').optional(),
  lastUpdated: z.number().optional(),
  lastUpdatedAt: z.number().optional(),
  lastUpdatedBy: z.string().optional(),
  notes: z.string().optional(),
})

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>

// Product Schema
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string(),
  priceUsd: z.number().positive('USD price must be positive'),
  unit: z.enum(['unit', 'kg', 'liter', 'meter']).optional(),
  costUsd: z.number().positive('Cost must be positive').optional(),
  profitMargin: z.number().optional(),
  isReturnable: z.boolean().default(false),
  containerDeposit: z.number().default(0),
  quantity: z.number().default(0),
  stock: z.number().optional(),
  minStock: z.number().default(0),
  minStockLevel: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  createdBy: z.string(),
})

export type Product = z.infer<typeof ProductSchema>

// Inventory Transaction Schema
export const InventoryTransactionSchema = z.object({
  id: z.string(),
  productId: z.string(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number(),
  notes: z.string().optional(),
  createdAt: z.number(),
  createdBy: z.string(),
  transactionId: z.string().optional(),
})

export type InventoryTransaction = z.infer<typeof InventoryTransactionSchema>

// Cart Item Schema
export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive('Quantity must be positive'),
  priceUsdAtTime: z.number().positive(),
  discount: z.number().default(0),
})

export type CartItem = z.infer<typeof CartItemSchema>

// Payment Method Schema
export enum PaymentMethod {
  CASH = 'cash',
  MOBILE_PAYMENT = 'mobile_payment',
  WALLET = 'wallet',
  CARD = 'card',
}

// Transaction Schema
export const TransactionSchema = z.object({
  id: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    subtotal: z.number(),
  })),
  subtotalUsd: z.number(),
  totalAmount: z.number().optional(),
  exchangeRate: z.number(),
  paymentMethod: z.enum(['cash_usd', 'cash_bs', 'mobile_bs', 'wallet']),
  amountReceivedUsd: z.number().optional(),
  amountReceivedBs: z.number().optional(),
  changeUsd: z.number().optional(),
  changeBs: z.number().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.number(),
  createdBy: z.string().optional(),
  status: z.enum(['completed', 'pending', 'cancelled']).default('completed'),
  containerReturns: z.array(z.object({
    productId: z.string(),
    quantity: z.number(),
    creditUsd: z.number(),
  })).default([]),
})

export type Transaction = z.infer<typeof TransactionSchema>

// Wallet Transaction Schema
export const WalletTransactionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'PURCHASE']),
  amount: z.number(),
  balanceAfter: z.number(),
  reference: z.string().optional(),
  createdAt: z.number(),
})

export type WalletTransaction = z.infer<typeof WalletTransactionSchema>

// Wallet Schema
export const WalletSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  balance: z.number().default(0),
  currency: z.enum(['USD', 'Bs']),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Wallet = z.infer<typeof WalletSchema>

// Login Request Schema
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

// Session Schema
export const SessionSchema = z.object({
  token: z.string(),
  userId: z.string(),
  userRole: z.nativeEnum(UserRole),
  expiresAt: z.number(),
  createdAt: z.number(),
})

export type Session = z.infer<typeof SessionSchema>

// Dashboard Statistics
export interface DashboardStats {
  todayRevenue: number
  todayTransactions: number
  totalTransactions: number
  totalItems: number
  lowStockItems: number
  profitMargin: number
}
