import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, error, clearError } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    setLoading(true)

    const result = await login(email, password)
    
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="page" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Login</h2>
      
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label htmlFor="password" style={{ fontWeight: '500' }}>
              Password
            </label>
            <Link to="/forgot-password" style={{ color: '#4F46E5', fontSize: '14px' }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#007bff' }}>
          Register here
        </Link>
      </p>
    </div>
  )
}
