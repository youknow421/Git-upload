'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/lib/data'
import { ProductGrid } from './ProductGrid'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name-az' | 'name-za'
type ViewMode = 'grid' | 'list'

interface CategoryFeedProps {
  products: Product[]
  categoryName: string
}

const ITEMS_PER_PAGE = 12

export function CategoryFeed({ products, categoryName }: CategoryFeedProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Calculate price bounds from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 }
    const prices = products.map(p => p.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Stock filter
    if (inStockOnly) {
      result = result.filter(p => (p.stock ?? 10) > 0)
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-az':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-za':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'newest':
      default:
        break
    }

    return result
  }, [products, sortBy, priceRange, inStockOnly])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden text-sm text-indigo-600 font-medium"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortOption); handleFilterChange() }}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-az">Name: A-Z</option>
            <option value="name-za">Name: Z-A</option>
          </select>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center border border-gray-200 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-56 flex-shrink-0 space-y-6`}>
          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={priceBounds.min}
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) => { setPriceRange([Number(e.target.value), priceRange[1]]); handleFilterChange() }}
                  className="w-20 text-sm border border-gray-200 rounded px-2 py-1"
                  placeholder="Min"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={priceBounds.max}
                  value={priceRange[1]}
                  onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value)]); handleFilterChange() }}
                  className="w-20 text-sm border border-gray-200 rounded px-2 py-1"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceRange[1]}
                onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value)]); handleFilterChange() }}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => { setInStockOnly(e.target.checked); handleFilterChange() }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">In stock only</span>
            </label>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setPriceRange([priceBounds.min, priceBounds.max])
              setInStockOnly(false)
              setSortBy('newest')
              handleFilterChange()
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear all filters
          </button>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products match your filters</p>
              <button
                onClick={() => {
                  setPriceRange([priceBounds.min, priceBounds.max])
                  setInStockOnly(false)
                }}
                className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <ProductGrid products={paginatedProducts} />
          ) : (
            <ProductList products={paginatedProducts} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and adjacent pages
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                  })
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-sm rounded-md ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// List view component
function ProductList({ products }: { products: Product[] }) {
  const { addItem } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()

  return (
    <div className="space-y-4">
      {products.map(product => {
        const inWishlist = isInWishlist(product.id)
        const outOfStock = (product.stock ?? 10) === 0

        return (
          <div key={product.id} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <Link href={`/product/${product.slug}`} className="flex-shrink-0">
              <div className="relative w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
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
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/product/${product.slug}`}>
                <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-lg font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                {outOfStock && (
                  <span className="text-xs text-red-600 font-medium">Out of stock</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
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
                disabled={outOfStock}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
