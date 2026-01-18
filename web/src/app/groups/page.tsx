'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGroups } from '@/context/GroupContext'
import { useAuth } from '@/context/AuthContext'

export default function GroupsPage() {
  const { user } = useAuth()
  const { 
    groups, 
    createGroup, 
    deleteGroup, 
    setActiveGroup, 
    activeGroup,
    pendingInvites,
    acceptInvite,
    declineInvite,
    isLoading
  } = useGroups()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('')
  const [processingInvite, setProcessingInvite] = useState<string | null>(null)

  const handleCreate = async () => {
    if (newGroupName.trim()) {
      await createGroup(
        newGroupName.trim(), 
        newGroupDesc.trim(),
        expiresInDays ? Number(expiresInDays) : undefined
      )
      setNewGroupName('')
      setNewGroupDesc('')
      setExpiresInDays('')
      setShowCreateForm(false)
    }
  }

  const handleAcceptInvite = async (token: string) => {
    setProcessingInvite(token)
    await acceptInvite(token)
    setProcessingInvite(null)
  }

  const handleDeclineInvite = async (token: string) => {
    setProcessingInvite(token)
    await declineInvite(token)
    setProcessingInvite(null)
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <span className="text-6xl block mb-4">👥</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Groups</h1>
        <p className="text-gray-600 mb-6">
          Please log in to view and manage your groups.
        </p>
        <Link href="/login" className="btn btn-primary">
          Log In
        </Link>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
        </div>
      </div>
    )
  }

  const getExpirationStatus = (expiresAt: string | null) => {
    if (!expiresAt) return null
    
    const now = new Date()
    const expiry = new Date(expiresAt)
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    
    if (daysLeft <= 0) return { text: 'Expired', class: 'badge-danger' }
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, class: 'bg-yellow-100 text-yellow-800' }
    if (daysLeft <= 7) return { text: `${daysLeft}d left`, class: 'bg-orange-100 text-orange-800' }
    return { text: `${daysLeft}d left`, class: 'bg-gray-100 text-gray-700' }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-600 mt-1">Share shopping carts with friends and family</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          + Create Group
        </button>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-xl">📬</span>
            Pending Invites
            <span className="badge badge-info">{pendingInvites.length}</span>
          </h2>
          <div className="space-y-3">
            {pendingInvites.map(({ invite, groupName, groupDescription, memberCount }) => (
              <div key={invite.id} className="card p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>{invite.inviterName}</strong> invited you to join
                    </p>
                    <p className="font-semibold text-gray-900">{groupName}</p>
                    {groupDescription && (
                      <p className="text-sm text-gray-500 mt-1">{groupDescription}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {memberCount} member{memberCount !== 1 ? 's' : ''} • 
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.token)}
                      disabled={processingInvite === invite.token}
                      className="btn btn-primary text-sm"
                    >
                      {processingInvite === invite.token ? 'Joining...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.token)}
                      disabled={processingInvite === invite.token}
                      className="btn btn-secondary text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Group</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Family Shopping"
                className="input"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Shared shopping for family members"
                rows={3}
                className="input"
              />
            </div>
            <div>
              <label className="label">Auto-expire (optional)</label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : '')}
                className="input"
              >
                <option value="">Never expires</option>
                <option value="7">In 7 days</option>
                <option value="14">In 14 days</option>
                <option value="30">In 30 days</option>
                <option value="60">In 60 days</option>
                <option value="90">In 90 days</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The group will be archived after expiration
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="btn btn-primary">
                Create Group
              </button>
              <button onClick={() => setShowCreateForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {groups.length === 0 && pendingInvites.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl block mb-4">👥</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No groups yet</h2>
          <p className="text-gray-600 mb-6">
            Create a group to share shopping carts with friends and family!
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Your First Group
          </button>
        </div>
      ) : groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group) => {
            const isActive = activeGroup?.id === group.id
            const expirationStatus = getExpirationStatus(group.expiresAt)
            
            return (
              <div
                key={group.id}
                className={`card p-6 transition-all ${
                  isActive
                    ? 'ring-2 ring-indigo-500 bg-indigo-50'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      {isActive && (
                        <span className="badge badge-info">Active</span>
                      )}
                      {expirationStatus && (
                        <span className={`badge ${expirationStatus.class}`}>
                          ⏱️ {expirationStatus.text}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{group.description || 'No description'}</p>
                    
                    <div className="flex gap-6 mt-4 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        👥 {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        🛒 {group.sharedCart.length} item{group.sharedCart.length !== 1 ? 's' : ''}
                      </span>
                      {group.invites?.filter(i => i.status === 'pending').length > 0 && (
                        <span className="flex items-center gap-1 text-indigo-600">
                          📧 {group.invites.filter(i => i.status === 'pending').length} pending invite{group.invites.filter(i => i.status === 'pending').length !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-xs">
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/groups/${group.id}`}
                      className="btn btn-secondary text-sm"
                    >
                      View Details
                    </Link>
                    {isActive ? (
                      <button
                        onClick={() => setActiveGroup(null)}
                        className="btn btn-secondary text-sm"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveGroup(group.id)}
                        className="btn btn-primary text-sm"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="btn btn-danger text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Active Group Notice */}
      {activeGroup && (
        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-indigo-800 text-sm">
            ✓ <strong>{activeGroup.name}</strong> is currently active. Items you add to your cart will be shared with this group.
          </p>
        </div>
      )}
    </div>
  )
}
