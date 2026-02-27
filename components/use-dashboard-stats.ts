import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/lib/db'
import { DashboardStats } from '@/lib/types'

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getDashboardStats()
        if (isMounted) {
          setStats(data)
          setError(null)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return { stats, loading, error }
}
