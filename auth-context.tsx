'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { verifySession, logoutUser } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        
        if (storedToken) {
          const verifiedUser = await verifySession(storedToken)
          
          if (verifiedUser) {
            setUser(verifiedUser)
            setToken(storedToken)
          } else {
            // Token is invalid or expired
            localStorage.removeItem('auth_token')
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const logout = async () => {
    try {
      if (token) {
        await logoutUser(token)
      }
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear local state even if server logout fails
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
    }
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    logout,
    setUser,
    setToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
