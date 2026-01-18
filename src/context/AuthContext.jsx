import React, { createContext, useContext, useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load saved auth state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      // Verify token is still valid
      verifyToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  async function verifyToken(tokenToVerify) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      } else {
        // Token invalid, clear auth
        logout()
      }
    } catch (err) {
      console.error('Token verification failed:', err)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
      setToken(data.token)
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function register(email, password, name) {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setUser(data.user)
      setToken(data.token)
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function verifyEmail(verificationToken) {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-email?token=${verificationToken}`)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Email verification failed')
      }

      // Update user state with verified status
      setUser(data.user)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      
      return { success: true, user: data.user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function resendVerification() {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification')
      }

      return { success: true, message: data.message }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function updateProfile(updates) {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Update failed')
      }

      setUser(data.user)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function changePassword(currentPassword, newPassword) {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password change failed')
      }

      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Helper to make authenticated requests
  function authFetch(url, options = {}) {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified ?? false,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerification,
    authFetch,
    clearError: () => setError('')
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
