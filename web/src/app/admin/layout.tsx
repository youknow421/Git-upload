'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/campaigns', label: 'Campaigns' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isAdmin, user } = useAuth()

  // Simple admin check
  useEffect(() => {
    // Require auth and admin role for admin area
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin')
      return
    }
    if (!isAdmin) {
      router.push('/')
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-bold tracking-tight">
              Admin
            </Link>
            <span className="text-xs text-gray-500 hidden md:block">v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:text-gray-300">
              ← Back to Store
            </Link>
            <span className="text-sm text-gray-400">
              {user?.name || user?.email}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-2.5 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-medium border-l-2 border-indigo-600 pl-3.5'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
