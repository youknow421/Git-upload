'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useOrders } from '@/context/OrderContext'
import { Order } from '@/lib/api'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const { getOrder } = useOrders()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      getOrder(orderId).then((o) => {
        setOrder(o)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [orderId, getOrder])

  if (loading) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl block mb-4 animate-pulse">⏳</span>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <span className="text-6xl block mb-4">🎉</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your order has been received.
      </p>

      {order && (
        <div className="card p-6 text-left mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`badge ${
                order.status === 'completed' ? 'badge-success' :
                order.status === 'processing' ? 'badge-info' :
                order.status === 'pending' ? 'badge-warning' :
                'badge-danger'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-medium">${(order.total / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Items</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-600 text-sm mb-6">
        A confirmation email has been sent to your email address.
      </p>

      <div className="flex gap-4 justify-center">
        <Link href="/orders" className="btn btn-secondary">
          View Orders
        </Link>
        <Link href="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <span className="text-4xl block mb-4 animate-pulse">⏳</span>
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
