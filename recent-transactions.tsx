'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getRecentTransactions } from '@/lib/db'
import { Transaction } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getRecentTransactions(10)
        setTransactions(data)
      } catch (error) {
        console.error('Failed to load transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Last 10 transactions from your store</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium">Order #{transaction.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString('es-VE')} at{' '}
                    {new Date(transaction.createdAt).toLocaleTimeString('es-VE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${transaction.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground capitalize">{transaction.paymentMethod}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
