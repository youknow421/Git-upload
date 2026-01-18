'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { products as initialProducts, Product } from '@/lib/data'
import { SearchFilter } from '@/components/admin/SearchFilter'
import { StockBadge } from '@/components/admin/StatusBadge'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState } from '@/components/admin/EmptyState'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  //Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category || 'Uncategorized')))]

  useEffect(() => {
    let result = [...products]

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(p => (p.category || 'Uncategorized') === categoryFilter)
    }

    //Filter by search quer
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }

    //Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      } else {
        const stockA = a.stock ?? 0
        const stockB = b.stock ?? 0
        return sortOrder === 'asc' ? stockA - stockB : stockB - stockA
      }
    })

    setFilteredProducts(result)
  }, [products, categoryFilter, searchQuery, sortBy, sortOrder])

  const handleDelete = (product: Product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
      setShowDeleteModal(false)
      setProductToDelete(null)
    }
  }

  const lowStockCount = products.filter(p => (p.stock ?? 10) < 5 && (p.stock ?? 10) > 0).length
  const outOfStockCount = products.filter(p => (p.stock ?? 10) === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} total items</p>
        </div>
        <Link href="/admin/products/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">
          Add New
        </Link>
      </div>

      {/*Stats*/}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total" value={products.length} />
        <StatCard title="Categories" value={categories.length - 1} />
        <StatCard title="Low Stock" value={lowStockCount} highlight={lowStockCount > 0} />
        <StatCard title="Out of Stock" value={outOfStockCount} highlight={outOfStockCount > 0} />
      </div>

      {/*Filters*/}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search products..."
        filters={[
          {
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categories.map(cat => ({ value: cat, label: cat === 'all' ? 'All Categories' : cat })),
          },
        ]}
        sortOptions={[
          { value: 'name-asc', label: 'Name A-Z' },
          { value: 'name-desc', label: 'Name Z-A' },
          { value: 'price-asc', label: 'Price: Low to High' },
          { value: 'price-desc', label: 'Price: High to Low' },
          { value: 'stock-asc', label: 'Stock: Low First' },
          { value: 'stock-desc', label: 'Stock: High First' },
        ]}
        sortValue={`${sortBy}-${sortOrder}`}
        onSortChange={(val) => {
          const [by, order] = val.split('-')
          setSortBy(by as any)
          setSortOrder(order as any)
        }}
      />

      {/* Products Grid"dle" God im so funny */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description={searchQuery || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first product to get started'}
          icon="🏷️"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stock = product.stock ?? 10
                const isLowStock = stock < 5 && stock > 0
                const isOutOfStock = stock === 0
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              📦
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StockBadge stock={stock} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium ml-3"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/*Delete Confirmation Modal*/}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{productToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
