'use client'

import { useState } from 'react'
import { Product, ExchangeRate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Check, X } from 'lucide-react'
import { updateProduct } from '@/lib/db'

interface InventoryTableProps {
  products: Product[]
  exchangeRate: ExchangeRate | null
  onProductsChange: () => void
}

export default function InventoryTable({
  products,
  exchangeRate,
  onProductsChange,
}: InventoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const handleEditStart = (product: Product) => {
    setEditingId(product.id)
    setEditQuantity(product.quantity || 0)
  }

  const handleSaveQuantity = async (productId: string) => {
    setLoading(true)
    try {
      await updateProduct(productId, { quantity: editQuantity, updatedAt: Date.now() })
      setEditingId(null)
      onProductsChange()
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found. Add your first product to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map(product => {
        const quantity = product.quantity || 0
        const minStock = product.minStockLevel || product.minStock || 5
        const isLowStock = quantity < minStock && quantity > 0
        const isOutOfStock = quantity <= 0
        const priceBs = product.priceUsd * (exchangeRate?.rate || 1)
        const isEditing = editingId === product.id

        return (
          <Card key={product.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              {/* Product Info */}
              <div className="md:col-span-2 space-y-1">
                <p className="font-semibold line-clamp-2">{product.name}</p>
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>

              {/* Pricing */}
              <div className="space-y-1">
                <p className="text-sm font-medium">${product.priceUsd.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Bs. {priceBs.toFixed(2)}</p>
              </div>

              {/* Stock Status */}
              <div className="space-y-1">
                {isEditing ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min="0"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <div>
                    <p className={`text-sm font-semibold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : ''}`}>
                      {quantity} {product.unit || 'units'}
                    </p>
                    {(isLowStock || isOutOfStock) && (
                      <p className="text-xs flex items-center gap-1 text-orange-600">
                        <AlertCircle className="h-3 w-3" />
                        {isOutOfStock ? 'Out of stock' : 'Low stock'}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Min: {minStock}</p>
              </div>

              {/* Value */}
              <div className="space-y-1">
                <p className="text-sm font-medium">${(product.priceUsd * quantity).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Bs. {(priceBs * quantity).toFixed(2)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleSaveQuantity(product.id)}
                      disabled={loading}
                      className="h-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      className="h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditStart(product)}
                    className="h-8"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
