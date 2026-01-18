'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, User } from '@/lib/api'
import { StatusBadge } from '@/components/admin/StatusBadge'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params: { role?: string; search?: string } = {}
      if (roleFilter !== 'all') params.role = roleFilter
      if (searchQuery) params.search = searchQuery
      
      const response = await api.getAdminUsers(params)
      setUsers(response.users)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [roleFilter, searchQuery])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setUpdating(userId)
      await api.updateUserRole(userId, newRole)
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error: any) {
      alert(error.message || 'Failed to update role')
    } finally {
      setUpdating(null)
    }
  }

  const adminCount = users.filter(u => u.role === 'admin').length
  const userCount = users.filter(u => u.role === 'user').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage user roles and permissions</p>
        </div>
        <p className="text-gray-500">{total} total users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-gray-500 text-sm">Total Users</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-2xl font-bold text-indigo-600">{adminCount}</p>
          <p className="text-gray-500 text-sm">Admins</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-2xl font-bold">{userCount}</p>
          <p className="text-gray-500 text-sm">Regular Users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
          <p className="text-gray-500 text-lg">No users found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchQuery || roleFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Users will appear here once they register'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-indigo-100 text-indigo-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.emailVerified ? 'completed' : 'pending'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {updating === user.id ? (
                      <span className="text-sm text-gray-400">Updating...</span>
                    ) : (
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                        className="text-sm border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Admin users have full access to this console including order management, 
          product editing, and user role changes. Assign admin role carefully.
        </p>
      </div>
    </div>
  )
}
