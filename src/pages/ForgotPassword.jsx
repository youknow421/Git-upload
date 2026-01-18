import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="page" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
        <h2 style={{ color: '#059669' }}>Check Your Email</h2>
        <p style={{ marginBottom: '20px' }}>
          If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
        </p>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          The link will expire in 1 hour. Check your spam folder if you don't see it.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setSubmitted(false); setEmail(''); }}
            className="btn"
            style={{ backgroundColor: '#6B7280' }}
          >
            Try Different Email
          </button>
          <Link to="/login" className="btn" style={{ display: 'inline-block' }}>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Forgot Password</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Enter your email address and we'll send you a link to reset your password.
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
          <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
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
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Remember your password?{' '}
        <Link to="/login" style={{ color: '#4F46E5' }}>
          Log in
        </Link>
      </p>
    </div>
  )
}
