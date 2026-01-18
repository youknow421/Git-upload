'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, updateProfile, isEmailVerified, loading } = useAuth()
  
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (loading) {
    return <div className="text-center py-16">Loading...</div>
  }

  if (!user) {
    router.push('/login')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    const result = await updateProfile({ name, email })
    setSaving(false)

    if (result.success) {
      setMessage('Profile updated successfully')
    } else {
      setError(result.error || 'Update failed')
    }
  }

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>

      {/* Email Verification Status */}
      {!isEmailVerified && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 flex items-center justify-between">
          <div>
            <strong>⚠️ Email not verified</strong>
            <p className="text-sm mt-1">Please verify your email to access all features.</p>
          </div>
          <button className="btn bg-yellow-200 text-yellow-800 hover:bg-yellow-300 text-sm">
            Resend Verification
          </button>
        </div>
      )}

      {isEmailVerified && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
          ✅ <strong>Email verified</strong>
        </div>
      )}

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="label">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="label">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="label">Confirm New Password</label>
            <input
              id="confirmNewPassword"
              type="password"
              className="input"
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}
