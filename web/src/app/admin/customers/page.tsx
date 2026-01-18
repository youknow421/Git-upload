'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock customer data - in production, this would come from the API obvs
const mockCustomers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', orders: 5, totalSpent: 450.00, joinedAt: '2025-10-15', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', orders: 3, totalSpent: 280.00, joinedAt: '2025-11-02', status: 'active' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', orders: 8, totalSpent: 920.50, joinedAt: '2025-09-20', status: 'active' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', orders: 1, totalSpent: 75.00, joinedAt: '2025-12-01', status: 'active' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', orders: 0, totalSpent: 0, joinedAt: '2025-12-10', status: 'inactive' },
]

export default function AdminCustomersPage() {
  const [customers] = useState(mockCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'joined'>('joined')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredCustomers = customers
    .filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'orders':
          comparison = a.orders - b.orders
          break
        case 'spent':
          comparison = a.totalSpent - b.totalSpent
          break
        case 'joined':
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.orders, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-500">{totalCustomers} total customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold">{totalCustomers}</p>
          <p className="text-gray-500 text-sm">Total Customers</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
          <p className="text-gray-500 text-sm">Active Customers</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
          <p className="text-gray-500 text-sm">Avg Order Value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort:</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-')
                setSortBy(by as any)
                setSortOrder(order as any)
              }}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="joined-desc">Newest First</option>
              <option value="joined-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="orders-desc">Most Orders</option>
              <option value="spent-desc">Highest Spent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 text-lg">No customers found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Customers will appear here once they register'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{customer.orders}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold">${customer.totalSpent.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View Details
                    </button>
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
