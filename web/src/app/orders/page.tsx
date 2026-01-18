'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useOrders } from '@/context/OrderContext'
import { useAuth } from '@/context/AuthContext'

export default function OrdersPage() {
  const { orders, loading, error, fetchOrders } = useOrders()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated, fetchOrders])

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <span className="text-6xl block mb-4">🔒</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
        <p className="text-gray-600 mb-6">Please login to view your orders.</p>
        <Link href="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl block mb-4 animate-pulse">⏳</span>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <span className="text-6xl block mb-4">❌</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={fetchOrders} className="btn btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <span className="text-6xl block mb-4">📦</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h1>
        <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
        <Link href="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    )
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success'
      case 'processing':
        return 'badge-info'
      case 'pending':
        return 'badge-warning'
      case 'failed':
      case 'cancelled':
        return 'badge-danger'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="font-semibold text-gray-900">
                Total: ${(order.total / 100).toFixed(2)}
              </span>
              <Link
                href={`/orders/${order.id}`}
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
