'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import api, { Product, SearchResult } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addItem: addToCart } = useCart()
  const { isInWishlist, toggleItem } = useWishlist()

  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  // Filters from URL
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'relevance'
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const page = Number(searchParams.get('page')) || 1

  // Filter state
  const [priceRange, setPriceRange] = useState({ min: minPrice || '', max: maxPrice || '' })

  const search = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.searchProducts({
        query: query || undefined,
        category: category || undefined,
        sort: sort as any,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
        limit: 12,
      })
      setResults(result)
      if (result.filters.categories.length > 0) {
        setCategories(result.filters.categories)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [query, category, sort, minPrice, maxPrice, page])

  useEffect(() => {
    search()
  }, [search])

  // Load categories on mount
  useEffect(() => {
    api.getProductCategories().then(res => setCategories(res.categories)).catch(() => {})
  }, [])

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    // Reset to page 1 on filter change
    if (!updates.page) params.delete('page')
    router.push(`/search?${params.toString()}`)
  }

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRange.min || null,
      maxPrice: priceRange.max || null,
    })
  }

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              updateFilters({ q: formData.get('q') as string })
            }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search products..."
                className="w-full px-6 py-4 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
              >
                Search
              </button>
            </div>
          </form>
          {query && (
            <p className="text-center mt-4 text-white/80">
              {results?.total || 0} results for "{query}"
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
              <div className="space-y-2">
                <button
                  onClick={() => updateFilters({ category: null })}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                    !category ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateFilters({ category: cat })}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm capitalize ${
                      category === cat ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <button
                onClick={applyPriceFilter}
                className="w-full mt-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Apply
              </button>
            </div>

            {/* Clear Filters */}
            {(category || minPrice || maxPrice) && (
              <button
                onClick={() => router.push(`/search${query ? `?q=${query}` : ''}`)}
                className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 text-sm">
              {results?.total || 0} products
            </p>
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : results?.products.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">🔍</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <Link href="/" className="text-indigo-600 hover:underline">
                Browse all products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results?.products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInWishlist={isInWishlist(product.id)}
                    onToggleWishlist={() => toggleItem(product as any)}
                    onAddToCart={() => addToCart(product as any)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {results && results.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {page > 1 && (
                    <button
                      onClick={() => updateFilters({ page: String(page - 1) })}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      Previous
                    </button>
                  )}
                  <span className="px-4 py-2 text-gray-600">
                    Page {results.page} of {results.totalPages}
                  </span>
                  {page < results.totalPages && (
                    <button
                      onClick={() => updateFilters({ page: String(page + 1) })}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Product Card Component
function ProductCard({ 
  product, 
  isInWishlist, 
  onToggleWishlist, 
  onAddToCart 
}: { 
  product: Product
  isInWishlist: boolean
  onToggleWishlist: () => void
  onAddToCart: () => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
      <div className="relative aspect-square">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <button
          onClick={onToggleWishlist}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition"
        >
          {isInWishlist ? '❤️' : '🤍'}
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center text-sm">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-gray-600">{product.rating.toFixed(1)}</span>
              {product.reviewCount !== undefined && (
                <span className="text-gray-400 ml-1">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={onAddToCart}
            disabled={product.stock === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
