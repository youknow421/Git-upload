'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { api, Order, OrderItem } from '@/lib/api'
import { useAuth } from './AuthContext'

interface OrderContextType {
  orders: Order[]
  loading: boolean
  error: string | null
  currentOrder: Order | null
  fetchOrders: () => Promise<void>
  createOrder: (data: {
    items: OrderItem[]
    total: number
    customerName: string
    customerEmail: string
    couponCode?: string
  }) => Promise<{ success: boolean; order?: Order; paymentUrl?: string; error?: string }>
  getOrder: (id: string) => Promise<Order | null>
  setCurrentOrder: (order: Order | null) => void
  clearError: () => void
}

const OrderContext = createContext<OrderContextType | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const { user, token } = useAuth()

  // Sync API client token with auth
  useEffect(() => {
    if (token) {
      api.setToken(token)
    }
  }, [token])

  const fetchOrders = useCallback(async () => {
    if (!user?.email) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await api.listOrders(user.email)
      setOrders(response.orders)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  // Ftch orders when user changes
  useEffect(() => {
    if (user?.email) {
      fetchOrders()
    } else {
      setOrders([])
    }
  }, [user?.email, fetchOrders])

  const createOrder = async (data: {
    items: OrderItem[]
    total: number
    customerName: string
    customerEmail: string
    couponCode?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.createOrder(data)
      setCurrentOrder(response.order)
      //Refresh order list
      await fetchOrders()
      return { 
        success: true, 
        order: response.order,
        paymentUrl: response.paymentUrl
      }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getOrder = async (id: string): Promise<Order | null> => {
    try {
      const response = await api.getOrder(id)
      return response.order
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        currentOrder,
        fetchOrders,
        createOrder,
        getOrder,
        setCurrentOrder,
        clearError: () => setError(null),
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider')
  }
  return context
}
