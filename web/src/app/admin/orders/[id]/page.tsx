'use client'

import { useOrders } from '@/context/OrderContext'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { LoadingState } from '@/components/admin/EmptyState'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
const statusSteps: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getOrder } = useOrders()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      if (params.id) {
        const orderData = await getOrder(params.id as string)
        setOrder(orderData)
        setLoading(false)
      }
    }
    loadOrder()
  }, [params.id, getOrder])

  const currentStepIndex = statusSteps.indexOf(order.status as OrderStatus)

  if (loading) return <LoadingState message="Loading order..." />

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <Link href="/admin/orders" className="text-indigo-600 hover:underline mt-4 inline-block">
          ← Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700">← Back</Link>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
      </div>

      {/* Status Progress */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
          <div className="relative">
            <div className="flex items-center justify-between">
              {statusSteps.map((status, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                return (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      isCompleted 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    } ${isCurrent ? 'ring-4 ring-indigo-200' : ''}`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <p className={`mt-2 text-sm capitalize ${
                      isCompleted ? 'text-indigo-600 font-medium' : 'text-gray-500'
                    }`}>
                      {status}
                    </p>
                  </div>
                )
              })}
            </div>
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10 mx-16">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Update Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Update Status</h2>
        <div className="flex flex-wrap gap-3">
          {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
            <button
              key={status}
              onClick={async () => {
                if (order.status === status || updating) return
                setUpdating(true)
                try {
                  await api.updateOrderStatus(order.id, status)
                  setOrder({ ...order, status })
                } catch (error) {
                  setOrder({ ...order, status })
                } finally {
                  setUpdating(false)
                }
              }}
              disabled={updating || order.status === status}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                order.status === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {updating ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            {order.customerPhone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          {order.shippingAddress ? (
            <div className="space-y-1">
              <p className="font-medium">{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          ) : (
            <p className="text-gray-500">No shipping address provided</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="divide-y">
          {order.items.map((item: any, index: number) => (
            <div key={index} className="py-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                📦
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.productName || `Product #${item.productId}`}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold">
                ${(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        
        {/* Totals */}
        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          🖨️ Print Invoice
        </button>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          📧 Send Update Email
        </button>
      </div>
    </div>
  )
}
