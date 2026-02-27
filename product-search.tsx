'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Package } from 'lucide-react'
import { Product, ExchangeRate } from '@/lib/types'
import { getAllProducts as fetchAllProducts } from '@/lib/db'

interface ProductSearchProps {
  searchQuery: string
  exchangeRate: ExchangeRate | null
  onAddToCart: (product: Product) => void
}

export default function ProductSearch({
  searchQuery,
  exchangeRate,
  onAddToCart,
}: ProductSearchProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts()
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredProducts(
        products.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, products])

  const rate = exchangeRate?.rate || 1

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-32 bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredProducts.length === 0 ? (
        <Card className="col-span-full p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">
            {products.length === 0 ? 'No products available' : 'No products match your search'}
          </p>
        </Card>
      ) : (
        filteredProducts.map(product => (
          <Card key={product.id} className="p-4 space-y-3 hover:shadow-lg transition-shadow">
            <div className="space-y-1">
              <h3 className="font-semibold line-clamp-2">{product.name}</h3>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              <p className="text-xs text-muted-foreground">Stock: {product.stock || 0}</p>
            </div>

            <div className="bg-background p-3 rounded border space-y-1">
              <div className="text-sm font-semibold">${product.priceUsd.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                Bs. {(product.priceUsd * rate).toFixed(2)}
              </div>
            </div>

            {product.costUsd && (
              <div className="text-xs text-muted-foreground">
                Profit: {(((product.priceUsd - product.costUsd) / product.priceUsd) * 100).toFixed(1)}%
              </div>
            )}

            <Button
              onClick={() => onAddToCart(product)}
              className="w-full"
              size="sm"
              disabled={(product.stock || 0) <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </Card>
        ))
      )}
    </div>
  )
}
