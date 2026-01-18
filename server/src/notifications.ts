import { v4 as uuidv4 } from 'uuid'

export type NotificationType = 
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_failed'
  | 'price_drop'
  | 'back_in_stock'
  | 'group_invite'
  | 'group_update'
  | 'promo'
  | 'system'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any> // Additional data (orderId, productId, and other stuff.)
  read: boolean
  createdAt: Date
}

const notifications = new Map<string, Notification>()
const userNotifications = new Map<string, string[]>() // userId -> notificationIds

export function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
): Notification {
  const notification: Notification = {
    id: `notif_${uuidv4().slice(0, 8)}`,
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date(),
  }

  notifications.set(notification.id, notification)

  // Add to user's notification list
  const userNotifIds = userNotifications.get(userId) || []
  userNotifIds.unshift(notification.id) // Add to beginning
  userNotifications.set(userId, userNotifIds)

  return notification
}

export function getUserNotifications(userId: string, limit = 50): Notification[] {
  const userNotifIds = userNotifications.get(userId) || []
  return userNotifIds
    .slice(0, limit)
    .map(id => notifications.get(id))
    .filter((n): n is Notification => n !== undefined)
}

export function getUnreadCount(userId: string): number {
  const userNotifIds = userNotifications.get(userId) || []
  return userNotifIds
    .map(id => notifications.get(id))
    .filter((n): n is Notification => n !== undefined && !n.read)
    .length
}

export function markAsRead(notificationId: string): Notification | null {
  const notification = notifications.get(notificationId)
  if (!notification) return null

  notification.read = true
  notifications.set(notificationId, notification)
  return notification
}

export function markAllAsRead(userId: string): number {
  const userNotifIds = userNotifications.get(userId) || []
  let count = 0

  userNotifIds.forEach(id => {
    const notification = notifications.get(id)
    if (notification && !notification.read) {
      notification.read = true
      notifications.set(id, notification)
      count++
    }
  })

  return count
}

export function deleteNotification(notificationId: string): boolean {
  const notification = notifications.get(notificationId)
  if (!notification) return false

  // Remove from user's list
  const userNotifIds = userNotifications.get(notification.userId) || []
  const index = userNotifIds.indexOf(notificationId)
  if (index > -1) {
    userNotifIds.splice(index, 1)
    userNotifications.set(notification.userId, userNotifIds)
  }

  notifications.delete(notificationId)
  return true
}

// Notification templates
export function notifyOrderConfirmed(userId: string, orderNumber: string, total: number): Notification {
  return createNotification(
    userId,
    'order_confirmed',
    'Order Confirmed',
    `Your order #${orderNumber} for $${total.toFixed(2)} has been confirmed.`,
    { orderNumber }
  )
}

export function notifyOrderShipped(userId: string, orderNumber: string, trackingNumber?: string): Notification {
  return createNotification(
    userId,
    'order_shipped',
    'Order Shipped',
    `Your order #${orderNumber} is on its way!${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
    { orderNumber, trackingNumber }
  )
}

export function notifyOrderDelivered(userId: string, orderNumber: string): Notification {
  return createNotification(
    userId,
    'order_delivered',
    'Order Delivered',
    `Your order #${orderNumber} has been delivered. Enjoy!`,
    { orderNumber }
  )
}

export function notifyOrderCancelled(userId: string, orderNumber: string): Notification {
  return createNotification(
    userId,
    'order_cancelled',
    'Order Cancelled',
    `Your order #${orderNumber} has been cancelled.`,
    { orderNumber }
  )
}

export function notifyPaymentFailed(userId: string, orderNumber: string): Notification {
  return createNotification(
    userId,
    'payment_failed',
    'Payment Failed',
    `Payment for order #${orderNumber} failed. Please try again.`,
    { orderNumber }
  )
}

export function notifyPriceDrop(userId: string, productName: string, productId: string, newPrice: number): Notification {
  return createNotification(
    userId,
    'price_drop',
    'Price Drop Alert',
    `${productName} is now $${newPrice.toFixed(2)}!`,
    { productId, productName, newPrice }
  )
}

export function notifyBackInStock(userId: string, productName: string, productId: string): Notification {
  return createNotification(
    userId,
    'back_in_stock',
    'Back in Stock',
    `${productName} is back in stock!`,
    { productId, productName }
  )
}

export function notifyGroupInvite(userId: string, groupName: string, groupId: string, inviterName: string): Notification {
  return createNotification(
    userId,
    'group_invite',
    'Group Invite',
    `${inviterName} invited you to join "${groupName}"`,
    { groupId, groupName, inviterName }
  )
}

export function notifyPromo(userId: string, title: string, message: string, promoCode?: string): Notification {
  return createNotification(
    userId,
    'promo',
    title,
    message,
    { promoCode }
  )
}
