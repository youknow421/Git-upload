'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import api, { Product } from '@/lib/api'

interface RelatedProductsProps {
  productId: string
  limit?: number
}

export function RelatedProducts({ productId, limit = 4 }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRelatedProducts()
  }, [productId])

  const loadRelatedProducts = async () => {
    try {
      setLoading(true)
      const response = await api.getRelatedProducts(productId, limit)
      setProducts(response.products)
    } catch (error) {
      console.error('Failed to load related products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="mt-1 h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group"
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
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <h3 className="mt-2 font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-indigo-600">${product.price.toFixed(2)}</span>
              {product.rating !== undefined && product.rating > 0 && (
                <span className="text-sm text-gray-500">
                  ⭐ {product.rating.toFixed(1)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
