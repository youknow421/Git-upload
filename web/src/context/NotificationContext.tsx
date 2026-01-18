'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api, Notification } from '@/lib/api'
import { useAuth } from './AuthContext'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      const response = await api.getNotifications(50)
      setNotifications(response.notifications)
      setUnreadCount(response.unreadCount)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.deleteNotification(id)
      const notification = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [notifications])

  // Fetch on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isAuthenticated, fetchNotifications])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(async () => {
      try {
        const response = await api.getUnreadCount()
        setUnreadCount(response.unreadCount)
      } catch (error) {
        // Silent fail for polling
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
