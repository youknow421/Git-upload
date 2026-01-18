'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import api, { Product } from '@/lib/api'

interface RecentlyViewedProps {
  limit?: number
  excludeProductId?: string
}

export function RecentlyViewed({ limit = 5, excludeProductId }: RecentlyViewedProps) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    loadRecentlyViewed()
  }, [isAuthenticated, authLoading])

  const loadRecentlyViewed = async () => {
    try {
      setLoading(true)
      const response = await api.getRecentlyViewed(limit + 1)
      let items = response.products
      
      // Exclude current product if viewing a product page
      if (excludeProductId) {
        items = items.filter(p => String(p.id) !== excludeProductId)
      }
      
      setProducts(items.slice(0, limit))
    } catch (error) {
      console.error('Failed to load recently viewed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) return null
  if (!isAuthenticated) return null
  if (products.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {products.map(product => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="flex-shrink-0 w-40 group"
          >
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <span className="text-sm font-semibold text-indigo-600">
              ${product.price.toFixed(2)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
