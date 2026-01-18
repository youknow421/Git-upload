import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState('verifying') // verifying, valid, invalid, success
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setError('No reset token provided')
      return
    }

    async function verifyToken() {
      try {
        const response = await fetch(`${API_BASE}/api/auth/verify-reset-token?token=${token}`)
        const data = await response.json()

        if (data.valid) {
          setStatus('valid')
          setEmail(data.email)
        } else {
          setStatus('invalid')
          setError(data.error || 'Invalid or expired reset token')
        }
      } catch (err) {
        setStatus('invalid')
        setError('Failed to verify reset token')
      }
    }

    verifyToken()
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setStatus('success')
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'verifying') {
    return (
      <div className="page" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <h2>Verifying Reset Link...</h2>
        <p style={{ color: '#666' }}>Please wait while we verify your reset link.</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="page" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <h2 style={{ color: '#DC2626' }}>Invalid Reset Link</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
        <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
          The reset link may have expired or already been used.
        </p>
        <Link 
          to="/forgot-password" 
          className="btn"
          style={{ display: 'inline-block' }}
        >
          Request New Reset Link
        </Link>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="page" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ color: '#059669' }}>Password Reset!</h2>
        <p style={{ marginBottom: '20px' }}>
          Your password has been successfully reset.
        </p>
        <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
          Redirecting you to login...
        </p>
        <Link 
          to="/login" 
          className="btn"
          style={{ display: 'inline-block' }}
        >
          Log In Now
        </Link>
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Reset Password</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Enter a new password for <strong>{email}</strong>
      </p>
      
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            minLength={8}
            placeholder="Confirm your new password"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>

        <button 
          type="submit" 
          className="btn"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px',
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}
