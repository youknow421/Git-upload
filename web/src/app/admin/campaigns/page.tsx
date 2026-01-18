'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SearchFilter } from '@/components/admin/SearchFilter'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatCard } from '@/components/admin/StatCard'
import { EmptyState, LoadingState } from '@/components/admin/EmptyState'

// Campaign type based on PRD group-buying model
interface Campaign {
  id: string
  productId: string
  productName: string
  productImage: string
  status: 'draft' | 'open' | 'reached_target' | 'locked' | 'charging' | 'charged' | 'failed' | 'refunded'
  joinedCount: number
  targetMembers: number
  maxMembers: number | null
  priceRegular: number
  priceGroup: number
  deadline: string
  createdAt: string
  reachedTargetAt: string | null
  lockedAt: string | null
  chargedAt: string | null
}

// Mock campaigns data for demo
const mockCampaigns: Campaign[] = [
  {
    id: 'camp_1',
    productId: 'prod_1',
    productName: 'Sony 65" 4K Smart TV',
    productImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&h=100&fit=crop',
    status: 'open',
    joinedCount: 42,
    targetMembers: 50,
    maxMembers: 80,
    priceRegular: 5500,
    priceGroup: 4200,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reachedTargetAt: null,
    lockedAt: null,
    chargedAt: null,
  },
  {
    id: 'camp_2',
    productId: 'prod_2',
    productName: 'iPhone 15 Pro 256GB',
    productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop',
    status: 'reached_target',
    joinedCount: 100,
    targetMembers: 100,
    maxMembers: 150,
    priceRegular: 4999,
    priceGroup: 4299,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    reachedTargetAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lockedAt: null,
    chargedAt: null,
  },
  {
    id: 'camp_3',
    productId: 'prod_3',
    productName: 'Dyson V15 Vacuum',
    productImage: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=100&h=100&fit=crop',
    status: 'charged',
    joinedCount: 75,
    targetMembers: 75,
    maxMembers: 100,
    priceRegular: 2800,
    priceGroup: 1899,
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    reachedTargetAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lockedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    chargedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'camp_4',
    productId: 'prod_4',
    productName: 'Samsung Galaxy Watch 6',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    status: 'failed',
    joinedCount: 18,
    targetMembers: 50,
    maxMembers: null,
    priceRegular: 1299,
    priceGroup: 999,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reachedTargetAt: null,
    lockedAt: null,
    chargedAt: null,
  },
  {
    id: 'camp_5',
    productId: 'prod_5',
    productName: 'MacBook Air M3',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop',
    status: 'draft',
    joinedCount: 0,
    targetMembers: 30,
    maxMembers: 50,
    priceRegular: 5999,
    priceGroup: 5199,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    reachedTargetAt: null,
    lockedAt: null,
    chargedAt: null,
  },
]

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCampaigns(mockCampaigns)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let result = [...campaigns]

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c => 
        c.productName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      )
    }

    setFilteredCampaigns(result)
  }, [campaigns, statusFilter, searchQuery])

  const getStatusColor = (status: Campaign['status']) => {
    const colors: Record<Campaign['status'], string> = {
      draft: 'bg-gray-100 text-gray-700',
      open: 'bg-blue-100 text-blue-700',
      reached_target: 'bg-green-100 text-green-700',
      locked: 'bg-yellow-100 text-yellow-700',
      charging: 'bg-purple-100 text-purple-700',
      charged: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-orange-100 text-orange-700',
    }
    return colors[status]
  }

  const formatStatus = (status: Campaign['status']) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const getProgress = (campaign: Campaign) => {
    return Math.round((campaign.joinedCount / campaign.targetMembers) * 100)
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const end = new Date(deadline)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => ['open', 'reached_target'].includes(c.status)).length,
    completed: campaigns.filter(c => c.status === 'charged').length,
    failed: campaigns.filter(c => ['failed', 'refunded'].includes(c.status)).length,
  }

  if (loading) return <LoadingState message="Loading campaigns..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Manage group-buying campaigns</p>
        </div>
        <Link 
          href="/admin/campaigns/new" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          + Create Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Campaigns" value={stats.total} />
        <StatCard title="Active" value={stats.active} highlight={stats.active > 0} />
        <StatCard title="Completed" value={stats.completed} />
        <StatCard title="Failed/Refunded" value={stats.failed} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'draft', 'open', 'reached_target', 'locked', 'charged', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : formatStatus(status as Campaign['status'])}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Campaigns Table */}
      {filteredCampaigns.length === 0 ? (
        <EmptyState
          title="No campaigns found"
          description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first campaign to get started'}
          icon="🎯"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prices</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Left</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={campaign.productImage} 
                        alt={campaign.productName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{campaign.productName}</p>
                        <p className="text-xs text-gray-500">{campaign.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {formatStatus(campaign.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{campaign.joinedCount}/{campaign.targetMembers}</span>
                        <span className="text-gray-500">{getProgress(campaign)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            getProgress(campaign) >= 100 ? 'bg-green-500' :
                            getProgress(campaign) >= 70 ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${Math.min(getProgress(campaign), 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-400 line-through">₪{campaign.priceRegular}</p>
                      <p className="font-medium text-green-600">₪{campaign.priceGroup}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      getTimeRemaining(campaign.deadline) === 'Ended' ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {getTimeRemaining(campaign.deadline)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        View
                      </Link>
                      {campaign.status === 'draft' && (
                        <button className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          Publish
                        </button>
                      )}
                      {campaign.status === 'open' && (
                        <button className="px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                          Lock
                        </button>
                      )}
                    </div>
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
