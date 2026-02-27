'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import { updateExchangeRate, getExchangeRate } from '@/lib/db'
import { useExchangeRate } from '@/hooks/use-exchange-rate'

export default function ExchangeRateMaster() {
  const { exchangeRate, loading: rateLoading } = useExchangeRate()
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (exchangeRate) {
      setInputValue(exchangeRate.rate.toString())
    }
  }, [exchangeRate])

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const newRate = parseFloat(inputValue)

    if (isNaN(newRate) || newRate <= 0) {
      setError('Please enter a valid exchange rate (must be greater than 0)')
      return
    }

    setLoading(true)
    try {
      await updateExchangeRate(newRate)
      setSuccess(`Exchange rate updated to Bs. ${newRate.toFixed(2)} per USD`)
      setLastUpdate(new Date())
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to update exchange rate')
    } finally {
      setLoading(false)
    }
  }

  if (rateLoading) {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tasa del Día (Exchange Rate Master)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading exchange rate...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Tasa del Día (Exchange Rate Master)
        </CardTitle>
        <CardDescription>
          Set the official exchange rate. This updates all prices across the system in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Rate Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
            <p className="text-3xl font-bold text-primary">
              Bs. {exchangeRate?.rate.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Per 1 USD</p>
          </div>
          <div className="bg-background p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
            <p className="text-lg font-semibold">
              {exchangeRate?.lastUpdated 
                ? new Date(exchangeRate.lastUpdated).toLocaleDateString('es-VE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Never'
              }
            </p>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateRate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exchangeRate" className="text-base font-semibold">
              New Exchange Rate (Bs per USD)
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter rate (e.g., 2536.50)"
                  className="text-lg"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !inputValue}
                className="px-8"
              >
                {loading ? 'Updating...' : 'Update Rate'}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}
        </form>

        {/* Information Box */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Global Price Updates</AlertTitle>
          <AlertDescription>
            When you update the exchange rate, all product prices and calculations across POS, 
            inventory, and reports will automatically update in real-time. Connected clients will 
            see the new rate instantly.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
