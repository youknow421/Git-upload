import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import api, { Notification } from '../src/api'
import { useAuth } from '../src/AuthContext'

export function NotificationsScreen({ navigation }: any) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      const res = await api.getNotifications()
      setNotifications(res.notifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const onRefresh = () => {
    setRefreshing(true)
    loadNotifications()
  }

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emoji}>🔔</Text>
          <Text style={styles.emptyTitle}>Sign in to see notifications</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return '📦'
      case 'payment': return '💳'
      case 'group': return '👥'
      case 'promo': return '🎉'
      default: return '🔔'
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  return (
    <View style={styles.container}>
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerText}>{unreadCount} unread</Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emoji}>📭</Text>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            We'll notify you about orders, updates, and more
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.notification,
                !item.read && styles.notificationUnread
              ]}
              onPress={() => handleMarkRead(item.id)}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getIcon(item.type)}</Text>
              </View>
              <View style={styles.content}>
                <Text style={[styles.title, !item.read && styles.titleUnread]}>
                  {item.title}
                </Text>
                <Text style={styles.message} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  markAllText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  notification: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notificationUnread: {
    backgroundColor: '#f0f9ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: '#1f2937',
    marginBottom: 4,
  },
  titleUnread: {
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
