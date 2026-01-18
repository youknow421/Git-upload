'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/data'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()
  const inWishlist = isInWishlist(product.id)

  return (
    <div className="card group">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-indigo-600">
            ${product.price.toFixed(2)}
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => toggleItem(product)}
              className={`p-2 rounded-lg transition-colors ${
                inWishlist 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {inWishlist ? '❤️' : '🤍'}
            </button>
            
            <button
              onClick={() => addItem(product)}
              className="btn btn-primary text-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
