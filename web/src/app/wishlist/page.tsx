'use client'

import Link from 'next/link'
import { useWishlist } from '@/context/WishlistContext'
import { ProductCard } from '@/components/ProductCard'

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist()

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl block mb-4">❤️</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
        <p className="text-gray-600 mb-6">Save items you love for later!</p>
        <Link href="/" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600">{items.length} items saved</p>
        </div>
        <button onClick={clearWishlist} className="text-red-600 hover:text-red-700 text-sm">
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
