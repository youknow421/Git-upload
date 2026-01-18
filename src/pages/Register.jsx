import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register, error, clearError } = useAuth()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    setLocalError('')

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const result = await register(email, password, name)
    
    setLoading(false)
    if (result.success) {
      setShowVerificationMessage(true)
      // Navigate after a short delay so user sees the message
      setTimeout(() => navigate('/', { replace: true }), 3000)
    }
  }

  const displayError = localError || error

  if (showVerificationMessage) {
    return (
      <div className="page" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
        <h2 style={{ color: '#059669' }}>Account Created!</h2>
        <p style={{ marginBottom: '20px' }}>
          We've sent a verification email to <strong>{email}</strong>.
        </p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Please check your inbox and click the verification link to activate your account.
        </p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '20px' }}>
          Redirecting to home page...
        </p>
        <Link to="/" className="btn" style={{ marginTop: '20px', display: 'inline-block' }}>
          Go to Home Now
        </Link>
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Create Account</h2>
      
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

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
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
            placeholder="you@example.com"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '12px', fontSize: '1rem' }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#007bff' }}>
          Login here
        </Link>
      </p>
    </div>
  )
}
