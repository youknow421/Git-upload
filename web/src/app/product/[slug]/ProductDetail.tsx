'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Product } from '@/lib/data'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import ProductReviews from '@/components/ProductReviews'
import { RelatedProducts } from '@/components/RelatedProducts'
import { RecentlyViewed } from '@/components/RecentlyViewed'
import api from '@/lib/api'

interface Props {
  product: Product
}

export function ProductDetail({ product }: Props) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()
  const { isAuthenticated } = useAuth()
  const inWishlist = isInWishlist(product.id)

  // Track product view for recently viewed
  useEffect(() => {
    if (isAuthenticated) {
      api.trackProductView(String(product.id)).catch(() => {})
    }
  }, [product.id, isAuthenticated])

  const handleAddToCart = () => {
    addItem(product, quantity)
  }

  // Stock indicator
  const stockStatus = product.stock !== undefined 
    ? product.stock <= 0 
      ? { text: 'Out of Stock', color: 'text-red-600' }
      : product.stock <= 5 
        ? { text: `Only ${product.stock} left!`, color: 'text-orange-600' }
        : { text: 'In Stock', color: 'text-green-600' }
    : { text: 'In Stock', color: 'text-green-600' }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/" className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
        ← Back to Products
      </Link>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        
        {/* Details */}
        <div>
          <div className="mb-2">
            <Link 
              href={`/category/${product.category}`}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              {product.category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {product.description}
          </p>
          
          <div className="text-3xl font-bold text-indigo-600 mb-6">
            ${product.price.toFixed(2)}
          </div>
          
          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="btn btn-secondary"
              >
                -
              </button>
              <span className="text-xl font-medium w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="btn btn-secondary"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="btn btn-primary flex-1 py-3"
            >
              Add to Cart - ${(product.price * quantity).toFixed(2)}
            </button>
            
            <button
              onClick={() => toggleItem(product)}
              className={`btn p-3 ${
                inWishlist 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'btn-secondary'
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {inWishlist ? '❤️' : '🤍'}
            </button>
          </div>
          
          {/* Extra Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">SKU</dt>
                <dd className="text-gray-900">PRD-{product.id.toString().padStart(4, '0')}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900">
                  {product.category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Availability</dt>
                <dd className={stockStatus.color}>{stockStatus.text}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Shipping</dt>
                <dd className="text-gray-900">Free over $50</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews productId={String(product.id)} />

      {/* Related Products */}
      <RelatedProducts productId={String(product.id)} />

      {/* Recently Viewed */}
      <RecentlyViewed excludeProductId={String(product.id)} />
    </div>
  )
}
