'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl block mb-4">🛒</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Add some products to get started!</p>
        <Link href="/" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button onClick={clearCart} className="text-red-600 hover:text-red-700 text-sm">
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card p-4 flex gap-4">
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <Link href={`/product/${product.slug}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                  {product.name}
                </Link>
                <p className="text-indigo-600 font-medium">${product.price.toFixed(2)}</p>
                
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="ml-auto text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">{totalPrice >= 50 ? 'Free' : '$5.00'}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-indigo-600">
                  ${(totalPrice + (totalPrice >= 50 ? 0 : 5)).toFixed(2)}
                </span>
              </div>
            </div>
            
            <Link href="/checkout" className="btn btn-primary w-full mt-6 py-3 text-center block">
              Proceed to Checkout
            </Link>
            
            <Link href="/" className="block text-center text-indigo-600 hover:text-indigo-700 mt-4 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
