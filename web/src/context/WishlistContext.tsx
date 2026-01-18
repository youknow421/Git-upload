'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Product } from '@/lib/data'
import api from '@/lib/api'
import { useAuth } from './AuthContext'

interface WishlistContextType {
  items: Product[]
  itemCount: number
  loading: boolean
  isInWishlist: (productId: number | string) => boolean
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: number | string) => Promise<void>
  toggleItem: (product: Product) => Promise<void>
  clearWishlist: () => Promise<void>
  refresh: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  // Load wishlist from API when authenticated, or localStorage when not
  const loadWishlist = useCallback(async () => {
    if (authLoading) return
    
    if (isAuthenticated) {
      try {
        setLoading(true)
        const response = await api.getWishlist()
        setItems(response.items as Product[])
      } catch (error) {
        console.error('Failed to load wishlist:', error)
        // Fallback to localStorage
        const saved = localStorage.getItem('wishlist')
        if (saved) setItems(JSON.parse(saved))
      } finally {
        setLoading(false)
      }
    } else {
      // Use localStorage for guests
      const saved = localStorage.getItem('wishlist')
      if (saved) setItems(JSON.parse(saved))
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  // Sync to localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(items))
    }
  }, [items, isAuthenticated])

  const isInWishlist = useCallback((productId: number | string) => {
    const id = String(productId)
    return items.some(item => String(item.id) === id)
  }, [items])

  const addItem = useCallback(async (product: Product) => {
    if (isAuthenticated) {
      try {
        const response = await api.addToWishlist(String(product.id))
        setItems(response.items as Product[])
      } catch (error) {
        console.error('Failed to add to wishlist:', error)
      }
    } else {
      setItems(prev => {
        if (prev.some(item => item.id === product.id)) return prev
        return [...prev, product]
      })
    }
  }, [isAuthenticated])

  const removeItem = useCallback(async (productId: number | string) => {
    if (isAuthenticated) {
      try {
        const response = await api.removeFromWishlist(String(productId))
        setItems(response.items as Product[])
      } catch (error) {
        console.error('Failed to remove from wishlist:', error)
      }
    } else {
      setItems(prev => prev.filter(item => String(item.id) !== String(productId)))
    }
  }, [isAuthenticated])

  const toggleItem = useCallback(async (product: Product) => {
    if (isAuthenticated) {
      try {
        const response = await api.toggleWishlistItem(String(product.id))
        setItems(response.items as Product[])
      } catch (error) {
        console.error('Failed to toggle wishlist item:', error)
      }
    } else {
      if (isInWishlist(product.id)) {
        setItems(prev => prev.filter(item => item.id !== product.id))
      } else {
        setItems(prev => [...prev, product])
      }
    }
  }, [isAuthenticated, isInWishlist])

  const clearWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await api.clearWishlist()
        setItems([])
      } catch (error) {
        console.error('Failed to clear wishlist:', error)
      }
    } else {
      setItems([])
    }
  }, [isAuthenticated])

  const refresh = useCallback(async () => {
    await loadWishlist()
  }, [loadWishlist])

  return (
    <WishlistContext.Provider value={{
      items,
      itemCount: items.length,
      loading,
      isInWishlist,
      addItem,
      removeItem,
      toggleItem,
      clearWishlist,
      refresh,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}
