import { useEffect, useState } from 'react'
import { onExchangeRateChange } from '@/lib/db'
import { ExchangeRate } from '@/lib/types'

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    
    // Subscribe to real-time exchange rate updates
    const unsubscribe = onExchangeRateChange((rate) => {
      setExchangeRate(rate)
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { exchangeRate, loading, error }
}
