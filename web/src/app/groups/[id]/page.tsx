'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGroups, GroupMember, GroupActivity } from '@/context/GroupContext'
import { useAuth } from '@/context/AuthContext'
import { products, Product } from '@/lib/data'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  
  const { user } = useAuth()
  const { 
    groups, 
    removeMember, 
    updateMemberRole, 
    updateGroup, 
    removeFromSharedCart,
    sendInvite,
    cancelInvite,
    extendExpiration,
    transferOwnership,
    getGroupActivity
  } = useGroups()
  
  const group = groups.find((g) => g.id === groupId)
  
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  
  const [activities, setActivities] = useState<GroupActivity[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [extendDays, setExtendDays] = useState(30)
  
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [newOwnerId, setNewOwnerId] = useState('')

  // Load activity
  useEffect(() => {
    if (groupId) {
      setLoadingActivity(true)
      getGroupActivity(groupId, 10).then(acts => {
        setActivities(acts)
        setLoadingActivity(false)
      })
    }
  }, [groupId, getGroupActivity])

  if (!group) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl block mb-4">🔍</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Group not found</h1>
        <p className="text-gray-600 mb-6">This group may have been deleted or you don't have access.</p>
        <Link href="/groups" className="btn btn-primary">
          Back to Groups
        </Link>
      </div>
    )
  }

  const currentUserMember = group.members.find(m => m.userId === user?.id)
  const isOwner = currentUserMember?.role === 'owner'
  const isAdmin = currentUserMember?.role === 'admin' || isOwner
  const pendingInvites = group.invites?.filter(i => i.status === 'pending') || []

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return
    
    setInviteSending(true)
    setInviteMessage(null)
    
    const success = await sendInvite(groupId, inviteEmail.trim())
    
    if (success) {
      setInviteMessage({ type: 'success', text: `Invite sent to ${inviteEmail}` })
      setInviteEmail('')
    } else {
      setInviteMessage({ type: 'error', text: 'Failed to send invite. User may already be a member.' })
    }
    
    setInviteSending(false)
  }

  const handleUpdate = async () => {
    if (editName.trim()) {
      await updateGroup(groupId, { name: editName.trim(), description: editDesc.trim() })
      setIsEditing(false)
    }
  }

  const startEdit = () => {
    setEditName(group.name)
    setEditDesc(group.description)
    setIsEditing(true)
  }

  const handleExtend = async () => {
    await extendExpiration(groupId, extendDays)
    setShowExtendModal(false)
  }

  const handleTransfer = async () => {
    if (newOwnerId) {
      await transferOwnership(groupId, newOwnerId)
      setShowTransferModal(false)
      setNewOwnerId('')
    }
  }

  // Get products from shared cart
  const sharedCartProducts = group.sharedCart
    .map(id => products.find(p => String(p.id) === id || p.id === Number(id)))
    .filter((p): p is Product => p !== undefined)

  const getRoleBadgeClass = (role: GroupMember['role']) => {
    switch (role) {
      case 'owner': return 'badge-success'
      case 'admin': return 'badge-info'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined': return '👋'
      case 'member_left': return '👋'
      case 'item_added': return '🛒'
      case 'item_removed': return '🗑️'
      case 'invite_sent': return '📧'
      case 'group_updated': return '⚙️'
      default: return '📌'
    }
  }

  const getExpirationInfo = () => {
    if (!group.expiresAt) return null
    
    const now = new Date()
    const expiry = new Date(group.expiresAt)
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    
    if (daysLeft <= 0) return { text: 'Expired', urgent: true }
    if (daysLeft <= 3) return { text: `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`, urgent: true }
    if (daysLeft <= 7) return { text: `Expires in ${daysLeft} days`, urgent: false }
    return { text: `Expires on ${expiry.toLocaleDateString()}`, urgent: false }
  }

  const expirationInfo = getExpirationInfo()

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/groups" className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
        ← Back to Groups
      </Link>

      {/* Expiration Warning */}
      {expirationInfo?.urgent && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-medium text-yellow-800">{expirationInfo.text}</p>
              <p className="text-sm text-yellow-600">
                {isOwner ? 'Extend the group to keep it active' : 'Contact the owner to extend'}
              </p>
            </div>
          </div>
          {isOwner && (
            <button onClick={() => setShowExtendModal(true)} className="btn btn-primary text-sm">
              Extend Group
            </button>
          )}
        </div>
      )}

      {/* Group Header */}
      <div className="card p-6 mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="label">Group Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="input"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleUpdate} className="btn btn-primary">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                {expirationInfo && !expirationInfo.urgent && (
                  <span className="badge bg-gray-100 text-gray-600 text-xs">
                    {expirationInfo.text}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">{group.description || 'No description'}</p>
              <p className="text-sm text-gray-500 mt-2">
                Created {new Date(group.createdAt).toLocaleDateString()} by {group.ownerName}
              </p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <button onClick={startEdit} className="btn btn-secondary">
                  Edit Group
                </button>
              )}
              {isOwner && (
                <button onClick={() => setShowTransferModal(true)} className="btn btn-secondary text-sm">
                  Transfer Ownership
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Members Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Members ({group.members.length})
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="btn btn-primary text-sm"
              >
                + Invite Member
              </button>
            )}
          </div>

          {/* Invite Form */}
          {showInviteForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="input"
              />
              {inviteMessage && (
                <p className={`text-sm ${inviteMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {inviteMessage.text}
                </p>
              )}
              <div className="flex gap-2">
                <button 
                  onClick={handleSendInvite} 
                  disabled={inviteSending}
                  className="btn btn-primary text-sm"
                >
                  {inviteSending ? 'Sending...' : 'Send Invite'}
                </button>
                <button onClick={() => setShowInviteForm(false)} className="btn btn-secondary text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Pending Invites</p>
              <div className="space-y-2">
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg text-sm">
                    <div>
                      <span className="text-gray-700">{invite.email}</span>
                      <span className="text-gray-400 ml-2">
                        (expires {new Date(invite.expiresAt).toLocaleDateString()})
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => cancelInvite(groupId, invite.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    <span className={`badge ${getRoleBadgeClass(member.role)}`}>
                      {member.role}
                    </span>
                    {member.userId === user?.id && (
                      <span className="text-xs text-gray-400">(you)</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{member.email}</span>
                </div>
                
                {member.role !== 'owner' && isOwner && (
                  <div className="flex gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(groupId, member.id, e.target.value as 'admin' | 'member')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => removeMember(groupId, member.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shared Cart Section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Shared Cart ({group.sharedCart.length} items)
          </h2>

          {sharedCartProducts.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-2">🛒</span>
              <p className="text-gray-500 text-sm">No items in shared cart</p>
              <p className="text-gray-400 text-xs mt-1">
                Items added while this group is active will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedCartProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-indigo-600">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromSharedCart(groupId, String(product.id))}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Section */}
      <div className="card p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        {loadingActivity ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <p className="text-gray-900">
                    <strong>{activity.userName}</strong>{' '}
                    <span className="text-gray-600">{activity.details}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Extend Group</h3>
            <p className="text-gray-600 mb-4">How long do you want to extend the group?</p>
            <select
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              className="input mb-4"
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleExtend} className="btn btn-primary flex-1">
                Extend
              </button>
              <button onClick={() => setShowExtendModal(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Ownership</h3>
            <p className="text-gray-600 mb-4">Select the new owner of this group:</p>
            <select
              value={newOwnerId}
              onChange={(e) => setNewOwnerId(e.target.value)}
              className="input mb-4"
            >
              <option value="">Select a member</option>
              {group.members
                .filter(m => m.role !== 'owner')
                .map(m => (
                  <option key={m.id} value={m.userId}>{m.name}</option>
                ))}
            </select>
            <p className="text-sm text-yellow-600 mb-4">
              ⚠️ You will become an admin after transferring ownership.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleTransfer} 
                disabled={!newOwnerId}
                className="btn btn-primary flex-1"
              >
                Transfer
              </button>
              <button onClick={() => setShowTransferModal(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
