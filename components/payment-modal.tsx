'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Product, ExchangeRate } from '@/lib/types'
import { createTransaction } from '@/lib/db'

interface PaymentModalProps {
  total: number
  totalBs: number
  items: (Product & { cartQuantity: number })[]
  exchangeRate: ExchangeRate | null
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentModal({
  total,
  totalBs,
  items,
  exchangeRate,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash_usd' | 'cash_bs' | 'mobile_bs' | 'wallet'>('cash_usd')
  const [amountReceived, setAmountReceived] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const change = paymentMethod === 'cash_usd'
    ? parseFloat(amountReceived || '0') - total
    : parseFloat(amountReceived || '0') - totalBs

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amount = parseFloat(amountReceived)
    const required = paymentMethod === 'cash_usd' ? total : totalBs

    if (isNaN(amount) || amount < required) {
      setError(`Insufficient payment. Minimum required: ${required.toFixed(2)}`)
      return
    }

    setLoading(true)
    try {
      await createTransaction({
        items: items.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity,
          unitPrice: item.priceUsd,
          subtotal: item.priceUsd * item.cartQuantity,
        })),
        subtotalUsd: total,
        paymentMethod,
        amountReceivedUsd: paymentMethod === 'cash_usd' ? amount : amount / (exchangeRate?.rate || 1),
        amountReceivedBs: paymentMethod === 'cash_usd' ? amount * (exchangeRate?.rate || 1) : amount,
        changeUsd: paymentMethod === 'cash_usd' ? change : 0,
        changeBs: paymentMethod === 'cash_bs' ? change : 0,
        notes,
        exchangeRate: exchangeRate?.rate || 1,
      }, '')

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Payment processing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment</CardTitle>
            <CardDescription>Process payment for transaction</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Payment processed successfully! Transaction saved.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items Count:</span>
                <span className="font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total (USD):</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total (Bs):</span>
                <span className="font-medium">Bs. {totalBs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium">1 USD = Bs. {(exchangeRate?.rate || 1).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Payment Method</Label>
              <Tabs value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cash_usd">Cash USD</TabsTrigger>
                  <TabsTrigger value="cash_bs">Cash Bs</TabsTrigger>
                  <TabsTrigger value="mobile_bs">Mobile</TabsTrigger>
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                </TabsList>

                <TabsContent value="cash_usd" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount Received (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder={`Minimum: $${total.toFixed(2)}`}
                      className="text-lg"
                      disabled={loading}
                    />
                  </div>
                  {amountReceived && change >= 0 && (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-sm text-green-700">
                        Change: ${change.toFixed(2)} USD
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cash_bs" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountBs">Amount Received (Bs)</Label>
                    <Input
                      id="amountBs"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder={`Minimum: Bs. ${totalBs.toFixed(2)}`}
                      className="text-lg"
                      disabled={loading}
                    />
                  </div>
                  {amountReceived && change >= 0 && (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-sm text-green-700">
                        Change: Bs. {change.toFixed(2)}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="mobile_bs" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobileRef">Mobile Payment Reference</Label>
                    <Input
                      id="mobileRef"
                      placeholder="Reference number"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Amount: Bs. {totalBs.toFixed(2)}
                  </p>
                </TabsContent>

                <TabsContent value="wallet" className="space-y-3 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Charge to customer wallet: Bs. {totalBs.toFixed(2)}
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add transaction notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !amountReceived}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Complete Payment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
