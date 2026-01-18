'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  authProvider: 'email' | 'google' | 'apple'
  avatarUrl?: string | null
  role?: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  error: string
  isAuthenticated: boolean
  isEmailVerified: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>
  loginWithApple: (idToken: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      verifyToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  async function verifyToken(tokenToVerify: string) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      } else {
        logout()
      }
    } catch (err) {
      console.error('Token verification failed:', err)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
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
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function loginWithSocial(provider: 'google' | 'apple', idToken: string) {
    setError('')
    try {
      const response = await fetch(`${API_BASE}/api/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, idToken })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Social login failed')
      }

      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function loginWithGoogle(idToken: string) {
    return loginWithSocial('google', idToken)
  }

  async function loginWithApple(idToken: string) {
    return loginWithSocial('apple', idToken)
  }

  async function register(email: string, password: string, name: string) {
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
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  async function updateProfile(updates: Partial<User>) {
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
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      isAuthenticated: !!user,
      isEmailVerified: user?.emailVerified ?? false,
      isAdmin: (user?.role ?? 'user') === 'admin',
      login,
      loginWithGoogle,
      loginWithApple,
      register,
      logout,
      updateProfile,
      clearError: () => setError('')
    }}>
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
