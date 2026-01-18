'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { SearchFilter } from '@/components/admin/SearchFilter'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EmptyState, LoadingState } from '@/components/admin/EmptyState'
import { api, Order } from '@/lib/api'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'failed' | 'cancelled'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getAdminOrders()
      setOrders(response.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    let result = [...orders]

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else {
        return sortOrder === 'desc' ? b.total - a.total : a.total - b.total
      }
    })

    setFilteredOrders(result)
  }, [orders, statusFilter, searchQuery, sortBy, sortOrder])

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (loading) return <LoadingState message="Loading orders..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by order ID, email, or name..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All', count: statusCounts.all },
              { value: 'pending', label: 'Pending', count: statusCounts.pending },
              { value: 'processing', label: 'Processing', count: statusCounts.processing },
              { value: 'shipped', label: 'Shipped', count: statusCounts.shipped },
              { value: 'delivered', label: 'Delivered', count: statusCounts.delivered },
              { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            ],
          },
        ]}
        sortOptions={[
          { value: 'date-desc', label: 'Newest First' },
          { value: 'date-asc', label: 'Oldest First' },
          { value: 'total-desc', label: 'Highest Value' },
          { value: 'total-asc', label: 'Lowest Value' },
        ]}
        sortValue={`${sortBy}-${sortOrder}`}
        onSortChange={(val) => {
          const [by, order] = val.split('-')
          setSortBy(by as 'date' | 'total')
          setSortOrder(order as 'asc' | 'desc')
        }}
      />

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => {
          const count = statusCounts[status as keyof typeof statusCounts]
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              {count > 0 && <span className="ml-1.5 opacity-75">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Orders will appear here once customers make purchases'}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm">#{order.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-sm">{order.customerName}</p>
                      <p className="text-gray-500 text-xs">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm">{order.items.length} items</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
