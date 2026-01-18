'use client'

import { useNotifications } from '@/context/NotificationContext'
import { useAuth } from '@/context/AuthContext'
import { Notification } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/notifications')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h2>
          <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification)
            
            const content = (
              <div className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-indigo-50/30' : ''}`}>
                <div className="flex gap-4">
                  <span className="text-2xl flex-shrink-0">
                    {notificationIcons[notification.type] || '📬'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                          aria-label="Delete notification"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )

            if (link) {
              return (
                <Link 
                  key={notification.id} 
                  href={link}
                  onClick={() => handleNotificationClick(notification)}
                  className="block"
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
          })}
        </div>
      )}
    </div>
  )
}
