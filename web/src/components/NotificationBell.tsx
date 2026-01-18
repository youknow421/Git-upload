'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '@/context/NotificationContext'
import { Notification } from '@/lib/api'
import Link from 'next/link'

const notificationIcons: Record<string, string> = {
  order_confirmed: '📦',
  order_shipped: '🚚',
  order_delivered: '✅',
  order_cancelled: '❌',
  payment_failed: '💳',
  price_drop: '💰',
  back_in_stock: '🔔',
  group_invite: '👥',
  group_update: '👥',
  promo: '🎉',
  system: 'ℹ️',
}

function getNotificationLink(notification: Notification): string | null {
  switch (notification.type) {
    case 'order_confirmed':
    case 'order_shipped':
    case 'order_delivered':
    case 'order_cancelled':
    case 'payment_failed':
      return notification.data?.orderNumber ? `/orders/${notification.data.orderNumber}` : '/orders'
    case 'price_drop':
    case 'back_in_stock':
      return notification.data?.productId ? `/product/${notification.data.productId}` : null
    case 'group_invite':
    case 'group_update':
      return notification.data?.groupId ? `/groups/${notification.data.groupId}` : '/groups'
    default:
      return null
  }
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      fetchNotifications()
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const link = getNotificationLink(notification)
                const content = (
                  <div className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notification.read ? 'bg-indigo-50/50' : ''}`}>
                    <div className="flex gap-3">
                      <span className="text-xl flex-shrink-0">
                        {notificationIcons[notification.type] || '📬'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 -m-1"
                            aria-label="Delete notification"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.createdAt)}</p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                  </div>
                )

                if (link) {
                  return (
                    <Link 
                      key={notification.id} 
                      href={link}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {content}
                    </Link>
                  )
                }

                return (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="cursor-pointer"
                  >
                    {content}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <Link 
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
