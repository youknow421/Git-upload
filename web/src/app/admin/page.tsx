'use client'

import { useEffect, useState } from 'react'
import { products } from '@/lib/data'
import { StatCard } from '@/components/admin/StatCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import Link from 'next/link'
import { api, Order } from '@/lib/api'

const recentActivity = [
  { id: 1, type: 'order', message: 'New order received', time: '5m ago', color: 'blue' },
  { id: 2, type: 'product', message: 'Stock alert: Wireless Headphones running low', time: '15m ago', color: 'yellow' },
  { id: 3, type: 'customer', message: 'New customer signup', time: '1h ago', color: 'green' },
  { id: 4, type: 'order', message: 'Order marked as shipped', time: '2h ago', color: 'blue' },
]

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersToday: 0,
    pendingOrders: 0,
    totalProducts: products.length,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, statsRes] = await Promise.all([
          api.getAdminOrders({ limit: 5 }),
          api.getDashboardStats()
        ])
        setOrders(ordersRes.orders)
        setStats({
          totalRevenue: statsRes.totalRevenue,
          ordersToday: statsRes.ordersToday,
          pendingOrders: statsRes.pendingOrders,
          totalProducts: statsRes.totalProducts,
        })
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
        <StatCard title="Today's Orders" value={stats.ordersToday} />
        <StatCard title="Needs Attention" value={stats.pendingOrders} highlight={stats.pendingOrders > 0} />
        <StatCard title="Products" value={stats.totalProducts} />
      </div>

      {/* Recent Orders & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-indigo-600 hover:text-indigo-700">View all →</Link>
          </div>
          {orders.length > 0 ? (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between py-3 px-3 -mx-3 rounded hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.orderNumber || order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-base font-semibold mb-4">Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  a.color === 'blue' ? 'bg-blue-500' :
                  a.color === 'yellow' ? 'bg-yellow-500' :
                  a.color === 'green' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
