'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react'
import { DashboardStats, ExchangeRate } from '@/lib/types'

interface StatsGridProps {
  stats: DashboardStats
  exchangeRate: ExchangeRate | null
}

export default function StatsGrid({ stats, exchangeRate }: StatsGridProps) {
  const todayRevenueBs = stats.todayRevenue * (exchangeRate?.rate || 1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue Today */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.todayRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Bs. {todayRevenueBs.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Total Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          <p className="text-xs text-muted-foreground">
            {stats.todayTransactions} today
          </p>
        </CardContent>
      </Card>

      {/* Inventory Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <p className="text-xs text-muted-foreground">
            {stats.lowStockItems} low stock
          </p>
        </CardContent>
      </Card>

      {/* Profit Margin */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.profitMargin.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Average across products
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
