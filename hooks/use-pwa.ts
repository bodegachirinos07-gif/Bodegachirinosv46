import { useEffect, useState } from 'react'

export interface PWAStatus {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  deferredPrompt: any
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isInstallable: false,
    isInstalled: false,
    deferredPrompt: null,
  })

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service worker registered:', registration)
        })
        .catch((error) => {
          console.error('[PWA] Service worker registration failed:', error)
        })
    }

    // Handle online/offline events
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }))
      // Trigger sync when coming back online
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register('sync-transactions').catch(console.error)
        })
      }
    }

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setStatus((prev) => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e,
      }))
    }

    const handleAppInstalled = () => {
      setStatus((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setStatus((prev) => ({ ...prev, isInstalled: true }))
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!status.deferredPrompt) return

    try {
      status.deferredPrompt.prompt()
      const { outcome } = await status.deferredPrompt.userChoice
      console.log(`[PWA] User response: ${outcome}`)
      setStatus((prev) => ({
        ...prev,
        deferredPrompt: null,
      }))
    } catch (error) {
      console.error('[PWA] Installation failed:', error)
    }
  }

  return {
    ...status,
    installApp,
  }
}
