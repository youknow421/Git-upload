'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api, { 
  Group, 
  GroupMember, 
  GroupInvite, 
  GroupActivity, 
  PendingInviteInfo 
} from '@/lib/api'

export type { Group, GroupMember, GroupInvite, GroupActivity }

interface GroupContextType {
  groups: Group[]
  activeGroup: Group | null
  pendingInvites: PendingInviteInfo[]
  isLoading: boolean
  error: string | null
  
  // Group CRUD
  createGroup: (name: string, description: string, expiresInDays?: number) => Promise<Group | null>
  deleteGroup: (groupId: string) => Promise<boolean>
  updateGroup: (groupId: string, updates: Partial<{ name: string; description: string }>) => Promise<boolean>
  setActiveGroup: (groupId: string | null) => void
  refreshGroups: () => Promise<void>
  
  // Members
  removeMember: (groupId: string, memberId: string) => Promise<boolean>
  updateMemberRole: (groupId: string, memberId: string, role: 'admin' | 'member') => Promise<boolean>
  transferOwnership: (groupId: string, newOwnerId: string) => Promise<boolean>
  
  // Invites
  sendInvite: (groupId: string, email: string) => Promise<boolean>
  acceptInvite: (token: string) => Promise<Group | null>
  declineInvite: (token: string) => Promise<boolean>
  cancelInvite: (groupId: string, inviteId: string) => Promise<boolean>
  refreshPendingInvites: () => Promise<void>
  
  // Shared Cart
  addToSharedCart: (groupId: string, productId: string) => Promise<boolean>
  removeFromSharedCart: (groupId: string, productId: string) => Promise<boolean>
  
  // Expiration
  extendExpiration: (groupId: string, days: number) => Promise<boolean>
  
  // Activity
  getGroupActivity: (groupId: string, limit?: number) => Promise<GroupActivity[]>
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [pendingInvites, setPendingInvites] = useState<PendingInviteInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeGroup = groups.find(g => g.id === activeGroupId) || null

  // Fetch groups on mount and when user changes
  const refreshGroups = useCallback(async () => {
    if (!user) {
      setGroups([])
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const fetchedGroups = await api.getGroups()
      setGroups(fetchedGroups)
      
      // Validate active group still exists
      if (activeGroupId && !fetchedGroups.find(g => g.id === activeGroupId)) {
        setActiveGroupId(null)
        localStorage.removeItem('activeGroupId')
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch groups')
    } finally {
      setIsLoading(false)
    }
  }, [user, activeGroupId])

  // Fetch pending invites
  const refreshPendingInvites = useCallback(async () => {
    if (!user) {
      setPendingInvites([])
      return
    }

    try {
      const invites = await api.getMyPendingInvites()
      setPendingInvites(invites)
    } catch (err) {
      console.error('Failed to fetch pending invites:', err)
    }
  }, [user])

  // Initial load
  useEffect(() => {
    if (user) {
      refreshGroups()
      refreshPendingInvites()
      
      // Load active group from localStorage
      const savedActiveId = localStorage.getItem('activeGroupId')
      if (savedActiveId) {
        setActiveGroupId(savedActiveId)
      }
    } else {
      setGroups([])
      setPendingInvites([])
      setActiveGroupId(null)
    }
  }, [user, refreshGroups, refreshPendingInvites])

  // Create group
  const createGroup = async (name: string, description: string, expiresInDays?: number): Promise<Group | null> => {
    if (!user) return null

    try {
      const group = await api.createGroup({ name, description, expiresInDays })
      setGroups(prev => [group, ...prev])
      return group
    } catch (err) {
      console.error('Failed to create group:', err)
      setError(err instanceof Error ? err.message : 'Failed to create group')
      return null
    }
  }

  // Delete group
  const deleteGroup = async (groupId: string): Promise<boolean> => {
    try {
      await api.deleteGroup(groupId)
      setGroups(prev => prev.filter(g => g.id !== groupId))
      
      if (activeGroupId === groupId) {
        setActiveGroupId(null)
        localStorage.removeItem('activeGroupId')
      }
      
      return true
    } catch (err) {
      console.error('Failed to delete group:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete group')
      return false
    }
  }

  // Update group
  const updateGroup = async (groupId: string, updates: Partial<{ name: string; description: string }>): Promise<boolean> => {
    try {
      const updatedGroup = await api.updateGroup(groupId, updates)
      setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g))
      return true
    } catch (err) {
      console.error('Failed to update group:', err)
      setError(err instanceof Error ? err.message : 'Failed to update group')
      return false
    }
  }

  // Set active group
  const setActiveGroup = (groupId: string | null) => {
    setActiveGroupId(groupId)
    if (groupId) {
      localStorage.setItem('activeGroupId', groupId)
    } else {
      localStorage.removeItem('activeGroupId')
    }
  }

  // Remove member
  const removeMember = async (groupId: string, memberId: string): Promise<boolean> => {
    try {
      await api.removeGroupMember(groupId, memberId)
      await refreshGroups()
      return true
    } catch (err) {
      console.error('Failed to remove member:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove member')
      return false
    }
  }

  // Update member role
  const updateMemberRole = async (groupId: string, memberId: string, role: 'admin' | 'member'): Promise<boolean> => {
    try {
      await api.updateGroupMemberRole(groupId, memberId, role)
      await refreshGroups()
      return true
    } catch (err) {
      console.error('Failed to update role:', err)
      setError(err instanceof Error ? err.message : 'Failed to update role')
      return false
    }
  }

  // Transfer ownership
  const transferOwnership = async (groupId: string, newOwnerId: string): Promise<boolean> => {
    try {
      await api.transferGroupOwnership(groupId, newOwnerId)
      await refreshGroups()
      return true
    } catch (err) {
      console.error('Failed to transfer ownership:', err)
      setError(err instanceof Error ? err.message : 'Failed to transfer ownership')
      return false
    }
  }

  // Send invite
  const sendInvite = async (groupId: string, email: string): Promise<boolean> => {
    try {
      await api.sendGroupInvite(groupId, email)
      await refreshGroups()
      return true
    } catch (err) {
      console.error('Failed to send invite:', err)
      setError(err instanceof Error ? err.message : 'Failed to send invite')
      return false
    }
  }

  // Accept invite
  const acceptInvite = async (token: string): Promise<Group | null> => {
    try {
      const group = await api.acceptInvite(token)
      await refreshGroups()
      await refreshPendingInvites()
      return group
    } catch (err) {
      console.error('Failed to accept invite:', err)
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
      return null
    }
  }

  // Decline invite
  const declineInvite = async (token: string): Promise<boolean> => {
    try {
      await api.declineInvite(token)
      await refreshPendingInvites()
      return true
    } catch (err) {
      console.error('Failed to decline invite:', err)
      setError(err instanceof Error ? err.message : 'Failed to decline invite')
      return false
    }
  }

  // Cancel invite
  const cancelInvite = async (groupId: string, inviteId: string): Promise<boolean> => {
    try {
      await api.cancelGroupInvite(groupId, inviteId)
      await refreshGroups()
      return true
    } catch (err) {
      console.error('Failed to cancel invite:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel invite')
      return false
    }
  }

  // Add to shared cart
  const addToSharedCart = async (groupId: string, productId: string): Promise<boolean> => {
    try {
      await api.addToGroupCart(groupId, productId)
      await refreshGroups()
      return true
    } catch (err) {
      console.error('Failed to add to cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to add to cart')
      return false
    }
  }

  // Remove from shared cart
  const removeFromSharedCart = async (groupId: string, productId: string): Promise<boolean> => {
    try {
      await api.removeFromGroupCart(groupId, productId)
      await refreshGroups()
      return true
    } catch (err) {
      console.error('Failed to remove from cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove from cart')
      return false
    }
  }

  // Extend expiration
  const extendExpiration = async (groupId: string, days: number): Promise<boolean> => {
    try {
      await api.extendGroupExpiration(groupId, days)
      await refreshGroups()
      return true
    } catch (err) {
      console.error('Failed to extend expiration:', err)
      setError(err instanceof Error ? err.message : 'Failed to extend expiration')
      return false
    }
  }

  // Get group activity
  const getGroupActivity = async (groupId: string, limit?: number): Promise<GroupActivity[]> => {
    try {
      return await api.getGroupActivity(groupId, limit)
    } catch (err) {
      console.error('Failed to fetch activity:', err)
      return []
    }
  }

  return (
    <GroupContext.Provider value={{
      groups,
      activeGroup,
      pendingInvites,
      isLoading,
      error,
      createGroup,
      deleteGroup,
      updateGroup,
      setActiveGroup,
      refreshGroups,
      removeMember,
      updateMemberRole,
      transferOwnership,
      sendInvite,
      acceptInvite,
      declineInvite,
      cancelInvite,
      refreshPendingInvites,
      addToSharedCart,
      removeFromSharedCart,
      extendExpiration,
      getGroupActivity,
    }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroups() {
  const context = useContext(GroupContext)
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider')
  }
  return context
}
