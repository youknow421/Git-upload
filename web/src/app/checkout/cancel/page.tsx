'use client'

import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <span className="text-6xl block mb-4">😔</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
      <p className="text-gray-600 mb-6">
        Your payment was cancelled. Your cart items are still saved.
      </p>

      <div className="flex gap-4 justify-center">
        <Link href="/cart" className="btn btn-secondary">
          Back to Cart
        </Link>
        <Link href="/checkout" className="btn btn-primary">
          Try Again
        </Link>
      </div>
    </div>
  )
}
