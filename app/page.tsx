'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'

export default function Home() {
  const router = useRouter()
  const { isLoading, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (user.role === 'cashier') {
          router.push('/pos')
        } else if (user.role === 'inventory_manager') {
          router.push('/inventory')
        }
      } else {
        router.push('/login')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  return null
}
