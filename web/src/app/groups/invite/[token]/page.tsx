'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useGroups } from '@/context/GroupContext'
import api, { InvitePreview } from '@/lib/api'

export default function GroupInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const { user, loading: authLoading } = useAuth()
  const { acceptInvite, declineInvite } = useGroups()
  
  const [inviteInfo, setInviteInfo] = useState<InvitePreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const info = await api.getInviteByToken(token)
        setInviteInfo(info)
      } catch (err) {
        setError('This invite is invalid or has expired.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvite()
  }, [token])

  const handleAccept = async () => {
    setProcessing(true)
    setError(null)

    const group = await acceptInvite(token)
    if (group) {
      router.push(`/groups/${group.id}`)
    } else {
      setError('Failed to accept invite. Please try again.')
      setProcessing(false)
    }
  }

  const handleDecline = async () => {
    setProcessing(true)
    const success = await declineInvite(token)
    if (success) {
      router.push('/groups')
    } else {
      setError('Failed to decline invite.')
      setProcessing(false)
    }
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invite...</p>
        </div>
      </div>
    )
  }

  // Invalid or expired invite
  if (error && !inviteInfo) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="card p-8 text-center">
          <span className="text-6xl block mb-4">😕</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/groups" className="btn btn-primary">
            Go to Groups
          </Link>
        </div>
      </div>
    )
  }

  // User not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="card p-8">
          <div className="text-center mb-6">
            <span className="text-5xl block mb-4">👥</span>
            <h1 className="text-2xl font-bold text-gray-900">You're Invited!</h1>
          </div>

          {inviteInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-600 text-center">
                <strong>{inviteInfo.inviterName}</strong> invited you to join
              </p>
              <p className="text-xl font-semibold text-center text-gray-900 mt-1">
                {inviteInfo.groupName}
              </p>
              {inviteInfo.groupDescription && (
                <p className="text-gray-500 text-center mt-2 text-sm">
                  {inviteInfo.groupDescription}
                </p>
              )}
              <p className="text-gray-400 text-center mt-3 text-xs">
                {inviteInfo.memberCount} member{inviteInfo.memberCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <p className="text-gray-600 text-center mb-6">
            Please log in or create an account to accept this invite.
          </p>

          <div className="space-y-3">
            <Link
              href={`/login?redirect=/groups/invite/${token}`}
              className="btn btn-primary w-full"
            >
              Log In
            </Link>
            <Link
              href={`/register?redirect=/groups/invite/${token}`}
              className="btn btn-secondary w-full"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // User logged in - show accept/decline
  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="card p-8">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-4">👥</span>
          <h1 className="text-2xl font-bold text-gray-900">You're Invited!</h1>
        </div>

        {inviteInfo && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
            <p className="text-gray-600 text-center">
              <strong>{inviteInfo.inviterName}</strong> invited you to join
            </p>
            <p className="text-2xl font-bold text-center text-gray-900 mt-2">
              {inviteInfo.groupName}
            </p>
            {inviteInfo.groupDescription && (
              <p className="text-gray-500 text-center mt-3">
                {inviteInfo.groupDescription}
              </p>
            )}
            <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
              <span>👥 {inviteInfo.memberCount} member{inviteInfo.memberCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={processing}
            className="btn btn-primary w-full"
          >
            {processing ? 'Joining...' : 'Join Group'}
          </button>
          <button
            onClick={handleDecline}
            disabled={processing}
            className="btn btn-secondary w-full"
          >
            Decline Invite
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          This invite expires on {new Date(inviteInfo?.expiresAt || '').toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
