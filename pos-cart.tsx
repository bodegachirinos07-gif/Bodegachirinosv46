'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react'
import { Product, ExchangeRate } from '@/lib/types'

interface CartItem extends Product {
  cartQuantity: number
}

interface POSCartProps {
  items: CartItem[]
  exchangeRate: ExchangeRate | null
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  cartTotal: number
  cartTotalBs: number
  onCheckout: () => void
}

export default function POSCart({
  items,
  exchangeRate,
  onUpdateQuantity,
  onRemove,
  cartTotal,
  cartTotalBs,
  onCheckout,
}: POSCartProps) {
  const rate = exchangeRate?.rate || 1

  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <CardTitle>Cart</CardTitle>
        </div>
        <CardDescription>{items.length} items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items in cart
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                {/* Price Display */}
                <div className="text-xs space-y-1">
                  <p className="font-semibold">${item.priceUsd.toFixed(2)} USD</p>
                  <p className="text-muted-foreground">
                    Bs. {(item.priceUsd * rate).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.cartQuantity}
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="h-7 text-center text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Line Total */}
                <div className="pt-2 border-t text-sm font-semibold">
                  <p>${(item.priceUsd * item.cartQuantity).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals */}
        <div className="border-t pt-4 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal USD:</span>
              <span className="font-medium">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal Bs:</span>
              <span className="font-medium">Bs. {cartTotalBs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Rate:</span>
              <span>1 USD = Bs. {rate.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-primary/10 p-3 rounded-lg space-y-1">
            <p className="text-xs text-muted-foreground">TOTAL</p>
            <p className="text-2xl font-bold">${cartTotal.toFixed(2)}</p>
            <p className="text-sm font-semibold text-primary">Bs. {cartTotalBs.toFixed(2)}</p>
          </div>

          <Button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full"
            size="lg"
          >
            Proceed to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
