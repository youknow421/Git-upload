import express from 'express'
import { requireAuth, AuthenticatedRequest } from '../auth.js'
import * as notifications from '../notifications.js'

const router = express.Router()

// Get user's notifications
router.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const { limit = '50' } = req.query
  const userId = req.userId!

  const userNotifications = notifications.getUserNotifications(userId, parseInt(limit as string))
  const unreadCount = notifications.getUnreadCount(userId)

  res.json({
    notifications: userNotifications,
    unreadCount,
    total: userNotifications.length,
  })
})

// Get unread count only
router.get('/unread-count', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.userId!
  const unreadCount = notifications.getUnreadCount(userId)
  res.json({ unreadCount })
})

// Mark single notification as read
router.patch('/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
  const notification = notifications.markAsRead(req.params.id)
  
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' })
  }

  // Verify ownership
  if (notification.userId !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  res.json({ notification })
})

// Mark all notifications as read
router.post('/mark-all-read', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.userId!
  const count = notifications.markAllAsRead(userId)
  res.json({ message: `Marked ${count} notifications as read`, count })
})

// Delete a notification
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const userNotifications = notifications.getUserNotifications(req.userId!)
  const notification = userNotifications.find(n => n.id === req.params.id)

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' })
  }

  notifications.deleteNotification(req.params.id)
  res.json({ message: 'Notification deleted' })
})

export default router
