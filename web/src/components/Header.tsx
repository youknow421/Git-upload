'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { NotificationBell } from './NotificationBell'

export function Header() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { totalItems } = useCart()
  const { itemCount } = useWishlist()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="text-2xl font-bold hover:opacity-90 flex-shrink-0">
            Project MVP
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 rounded-full text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </form>

          <nav className="flex items-center gap-4 lg:gap-6">
            <Link href="/search" className="md:hidden hover:opacity-80">
              🔍
            </Link>
            <Link href="/" className="hover:opacity-80 transition-opacity hidden lg:block">
              Home
            </Link>
            <Link href="/categories" className="hover:opacity-80 transition-opacity hidden lg:block">
              Categories
            </Link>
            <Link href="/groups" className="hover:opacity-80 transition-opacity hidden lg:block">
              Groups
            </Link>
            {isAuthenticated && (
              <Link href="/orders" className="hover:opacity-80 transition-opacity hidden lg:block">
                Orders
              </Link>
            )}
            <Link href="/wishlist" className="hover:opacity-80 transition-opacity relative">
              <span className="hidden lg:inline">Wishlist</span>
              <span className="lg:hidden">❤️</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="hover:opacity-80 transition-opacity relative">
              <span className="hidden lg:inline">Cart</span>
              <span className="lg:hidden">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <div className="text-gray-900">
                <NotificationBell />
              </div>
            )}
            {isAuthenticated ? (
              <Link href="/profile" className="hover:opacity-80 transition-opacity">
                {user?.name?.split(' ')[0] || 'Profile'}
              </Link>
            ) : (
              <Link href="/login" className="btn bg-white text-indigo-600 hover:bg-gray-100 py-1.5 px-4 text-sm">
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
