'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import api, { Order } from '@/lib/api'

interface Props {
  params: { id: string }
}

export default function OrderDetailPage({ params }: Props) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      setPageLoading(false)
      return
    }

    loadOrder()
  }, [params.id, isAuthenticated, authLoading])

  const loadOrder = async () => {
    try {
      setPageLoading(true)
      const response = await api.getOrder(params.id)
      setOrder(response.order)
    } catch (err: any) {
      setError(err.message || 'Failed to load order')
    } finally {
      setPageLoading(false)
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <span className="text-6xl block mb-4">🔒</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
        <p className="text-gray-600 mb-6">Please login to view your order.</p>
        <Link href="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <span className="text-6xl block mb-4">❌</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <p className="text-gray-600 mb-6">{error || 'This order could not be found.'}</p>
        <Link href="/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    )
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Pending Payment' }
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800', icon: '📦', label: 'Processing' }
      case 'shipped':
        return { color: 'bg-purple-100 text-purple-800', icon: '🚚', label: 'Shipped' }
      case 'delivered':
        return { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Delivered' }
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Completed' }
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800', icon: '❌', label: 'Cancelled' }
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Failed' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📋', label: status }
    }
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/orders" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
          ← Back to Orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full font-medium ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${(item.price / 100).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <TimelineItem
                icon="📝"
                title="Order Placed"
                date={order.createdAt}
                active
              />
              {order.status !== 'pending' && order.status !== 'failed' && order.status !== 'cancelled' && (
                <TimelineItem
                  icon="💳"
                  title="Payment Confirmed"
                  date={order.updatedAt}
                  active
                />
              )}
              {['shipped', 'delivered', 'completed'].includes(order.status) && (
                <TimelineItem
                  icon="🚚"
                  title="Shipped"
                  date={order.updatedAt}
                  active
                />
              )}
              {['delivered', 'completed'].includes(order.status) && (
                <TimelineItem
                  icon="✅"
                  title="Delivered"
                  date={order.updatedAt}
                  active
                />
              )}
              {order.status === 'failed' && (
                <TimelineItem
                  icon="❌"
                  title="Payment Failed"
                  date={order.updatedAt}
                  active
                  error
                />
              )}
              {order.status === 'cancelled' && (
                <TimelineItem
                  icon="❌"
                  title="Order Cancelled"
                  date={order.updatedAt}
                  active
                  error
                />
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${(order.total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">$0.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-indigo-600">${(order.total / 100).toFixed(2)}</span>
              </div>
            </div>

            {order.transactionId && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="text-sm font-mono text-gray-900 break-all">{order.transactionId}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p className="text-sm text-gray-600">{order.customerEmail}</p>
            </div>

            {order.status === 'pending' && (
              <div className="mt-6">
                <button className="w-full btn btn-primary">
                  Complete Payment
                </button>
              </div>
            )}

            {order.status === 'failed' && (
              <div className="mt-6">
                <Link href="/cart" className="w-full btn btn-primary block text-center">
                  Try Again
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Timeline Item Component
function TimelineItem({ 
  icon, 
  title, 
  date, 
  active, 
  error 
}: { 
  icon: string
  title: string
  date: string
  active?: boolean
  error?: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
        error 
          ? 'bg-red-100' 
          : active 
            ? 'bg-green-100' 
            : 'bg-gray-100'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${error ? 'text-red-600' : 'text-gray-900'}`}>{title}</p>
        <p className="text-sm text-gray-500">
          {new Date(date).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
