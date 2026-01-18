'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useOrders } from '@/context/OrderContext'
import api, { CouponValidationResponse } from '@/lib/api'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { createOrder, loading } = useOrders()
  
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerEmail, setCustomerEmail] = useState(user?.email || '')
  const [error, setError] = useState('')

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null)

  // Calculate totals
  const subtotal = totalPrice
  const discount = appliedCoupon ? appliedCoupon.discount / 100 : 0
  const finalTotal = Math.max(0, subtotal - discount)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <span className="text-6xl block mb-4">🔒</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
        <p className="text-gray-600 mb-6">Please login to complete your purchase.</p>
        <Link href="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <span className="text-6xl block mb-4">🛒</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some products before checkout.</p>
        <Link href="/" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please fill in all fields')
      return
    }

    const orderItems = items.map(({ product, quantity }) => ({
      productId: String(product.id),
      name: product.name,
      price: Math.round(product.price * 100), // Convert to cents
      quantity,
    }))

    const result = await createOrder({
      items: orderItems,
      total: Math.round(finalTotal * 100), // Use final total after discount
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      couponCode: appliedCoupon?.code,
    })

    if (result.success) {
      clearCart()
      if (result.paymentUrl) {
        // Redirect to payment provider
        window.location.href = result.paymentUrl
      } else {
        // No payment URL (mock mode), go to success page
        router.push(`/checkout/success?order=${result.order?.id}`)
      }
    } else {
      setError(result.error || 'Failed to create order')
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setCouponLoading(true)
    setCouponError('')

    try {
      // Convert to cents for validation
      const result = await api.validateCoupon(couponCode.trim(), Math.round(subtotal * 100))
      setAppliedCoupon(result)
      setCouponError('')
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4">
                <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {quantity}</p>
                </div>
                <div className="text-right">
                  <span className="font-medium">${(product.price * quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>

            {/* Coupon Section */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-green-700 font-medium">🎉 {appliedCoupon.code}</span>
                      <p className="text-sm text-green-600">
                        {appliedCoupon.type === 'percentage' 
                          ? `${appliedCoupon.value}% off` 
                          : `$${(appliedCoupon.value / 100).toFixed(2)} off`}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex justify-between text-sm mt-2 text-green-700">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Have a coupon?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-600 text-sm mt-2">{couponError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Try: WELCOME10, SAVE20, FLAT500</p>
                </div>
              )}
            </div>

            <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span className="text-indigo-600">${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3"
              >
                {loading ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/cart" className="text-indigo-600 hover:text-indigo-700">
          ← Back to Cart
        </Link>
      </div>
    </div>
  )
}
