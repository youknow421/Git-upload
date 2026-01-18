'use client'

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/admin/StatCard'
import { LoadingState } from '@/components/admin/EmptyState'

interface AnalyticsData {
  // Revenue metrics
  gmv: number
  revenue: number
  avgOrderValue: number
  
  // User metrics
  totalUsers: number
  newUsersToday: number
  activeUsers: number
  
  // Campaign metrics
  totalCampaigns: number
  activeCampaigns: number
  completionRate: number
  avgGroupSize: number
  
  // Conversion funnel
  productViews: number
  joinClicks: number
  successfulJoins: number
  conversionRate: number
  
  // Category performance
  categoryStats: { category: string; joins: number; gmv: number }[]
  
  // Daily trends (last 7 days)
  dailyStats: { date: string; revenue: number; orders: number; newUsers: number }[]
}

const mockAnalytics: AnalyticsData = {
  gmv: 245890,
  revenue: 24589,
  avgOrderValue: 3280,
  
  totalUsers: 1247,
  newUsersToday: 23,
  activeUsers: 456,
  
  totalCampaigns: 48,
  activeCampaigns: 12,
  completionRate: 68,
  avgGroupSize: 42,
  
  productViews: 12450,
  joinClicks: 2340,
  successfulJoins: 1890,
  conversionRate: 15.2,
  
  categoryStats: [
    { category: 'Electronics', joins: 892, gmv: 145000 },
    { category: 'Home', joins: 456, gmv: 58000 },
    { category: 'Fashion', joins: 312, gmv: 28000 },
    { category: 'Travel', joins: 198, gmv: 12000 },
    { category: 'Furniture', joins: 156, gmv: 9800 },
  ],
  
  dailyStats: [
    { date: '2026-01-12', revenue: 3200, orders: 12, newUsers: 18 },
    { date: '2026-01-13', revenue: 4100, orders: 15, newUsers: 22 },
    { date: '2026-01-14', revenue: 2800, orders: 9, newUsers: 14 },
    { date: '2026-01-15', revenue: 5200, orders: 18, newUsers: 31 },
    { date: '2026-01-16', revenue: 4500, orders: 16, newUsers: 25 },
    { date: '2026-01-17', revenue: 3900, orders: 14, newUsers: 19 },
    { date: '2026-01-18', revenue: 4800, orders: 17, newUsers: 23 },
  ],
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    setTimeout(() => {
      setData(mockAnalytics)
      setLoading(false)
    }, 500)
  }, [])

  if (loading || !data) return <LoadingState message="Loading analytics..." />

  const maxRevenue = Math.max(...data.dailyStats.map(d => d.revenue))
  const maxCategoryGmv = Math.max(...data.categoryStats.map(c => c.gmv))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Platform performance and insights</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="GMV" value={`₪${data.gmv.toLocaleString()}`} />
        <StatCard title="Revenue (10%)" value={`₪${data.revenue.toLocaleString()}`} />
        <StatCard title="Avg Order Value" value={`₪${data.avgOrderValue.toLocaleString()}`} />
        <StatCard title="Completion Rate" value={`${data.completionRate}%`} highlight={data.completionRate >= 60} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Revenue</h3>
          <div className="space-y-3">
            {data.dailyStats.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-20">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-20 text-right">₪{day.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="space-y-3">
            {data.categoryStats.map((cat) => (
              <div key={cat.category} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-24">{cat.category}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(cat.gmv / maxCategoryGmv) * 100}%` }}
                  />
                </div>
                <div className="text-right w-28">
                  <p className="text-sm font-medium">₪{cat.gmv.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{cat.joins} joins</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User & Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">User Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">+{data.newUsersToday}</p>
              <p className="text-sm text-gray-500">New Today</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.activeUsers}</p>
              <p className="text-sm text-gray-500">Active (7d)</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {((data.activeUsers / data.totalUsers) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">DAU/MAU</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Campaign Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{data.totalCampaigns}</p>
              <p className="text-sm text-gray-500">Total Campaigns</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.activeCampaigns}</p>
              <p className="text-sm text-gray-500">Active Now</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.completionRate}%</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{data.avgGroupSize}</p>
              <p className="text-sm text-gray-500">Avg Group Size</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-gray-700">{(data.productViews / 1000).toFixed(1)}k</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Product Views</p>
            <p className="text-xs text-gray-500">100%</p>
          </div>
          <div className="text-gray-300 text-2xl">→</div>
          <div className="text-center flex-1">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-blue-700">{(data.joinClicks / 1000).toFixed(1)}k</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Join Clicks</p>
            <p className="text-xs text-gray-500">{((data.joinClicks / data.productViews) * 100).toFixed(1)}%</p>
          </div>
          <div className="text-gray-300 text-2xl">→</div>
          <div className="text-center flex-1">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-green-700">{(data.successfulJoins / 1000).toFixed(1)}k</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Successful Joins</p>
            <p className="text-xs text-gray-500">{data.conversionRate}%</p>
          </div>
        </div>
      </div>

      {/* KPI Targets */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">KPI Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Conversion Rate', current: data.conversionRate, target: 20, unit: '%' },
            { label: 'Completion Rate', current: data.completionRate, target: 75, unit: '%' },
            { label: 'Pre-auth Success', current: 97.2, target: 95, unit: '%' },
            { label: 'Charge Success', current: 94.5, target: 92, unit: '%' },
          ].map((kpi) => {
            const progress = Math.min((kpi.current / kpi.target) * 100, 100)
            const isOnTrack = kpi.current >= kpi.target
            return (
              <div key={kpi.label} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{kpi.label}</span>
                  <span className={`text-xs font-medium ${isOnTrack ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isOnTrack ? '✓ On Track' : '! Below Target'}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">{kpi.current}{kpi.unit}</p>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isOnTrack ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: {kpi.target}{kpi.unit}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
