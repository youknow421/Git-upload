'use client'

import Link from 'next/link'
import { Product } from '@/lib/data'
import { ProductCard } from './ProductCard'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <p className="text-gray-600">Hand-picked just for you</p>
        </div>
        <Link href="/categories" className="text-indigo-600 hover:text-indigo-700 font-medium">
          View All →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
