import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, updateProfile, changePassword, resendVerification, isEmailVerified, error, clearError } = useAuth()
  
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [localError, setLocalError] = useState('')

  if (!user) {
    navigate('/login')
    return null
  }

  async function handleProfileUpdate(e) {
    e.preventDefault()
    clearError()
    setLocalError('')
    setSuccessMessage('')
    setProfileLoading(true)

    const result = await updateProfile({ name, email })
    
    setProfileLoading(false)
    if (result.success) {
      setSuccessMessage('Profile updated successfully')
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    clearError()
    setLocalError('')
    setSuccessMessage('')

    if (newPassword !== confirmPassword) {
      setLocalError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setLocalError('New password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)
    const result = await changePassword(currentPassword, newPassword)
    
    setPasswordLoading(false)
    if (result.success) {
      setSuccessMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  async function handleResendVerification() {
    clearError()
    setLocalError('')
    setSuccessMessage('')
    setResendLoading(true)

    const result = await resendVerification()
    
    setResendLoading(false)
    if (result.success) {
      setSuccessMessage('Verification email sent! Please check your inbox.')
    }
  }

  const displayError = localError || error

  return (
    <div className="page" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>My Profile</h2>
        <button onClick={handleLogout} className="btn" style={{ backgroundColor: '#dc3545' }}>
          Logout
        </button>
      </div>

      {displayError && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {displayError}
        </div>
      )}

      {successMessage && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {successMessage}
        </div>
      )}

      {/* Email Verification Status */}
      {!isEmailVerified && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          color: '#856404',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong>⚠️ Email not verified</strong>
            <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
              Please verify your email address to access all features.
            </p>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resendLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: resendLoading ? 'wait' : 'pointer',
              fontWeight: '500'
            }}
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      {isEmailVerified && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✅ <strong>Email verified</strong>
        </div>
      )}

      {/* Profile Info */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginTop: 0 }}>Account Information</h3>
        <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={profileLoading}
          >
            {profileLoading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '24px',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>Change Password</h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <div>
            <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={passwordLoading}
            style={{ backgroundColor: '#6c757d' }}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '20px', color: '#666', fontSize: '0.9rem' }}>
        Member since: {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
