import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api, { User } from './api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>
  loginWithApple: (idToken: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: { name?: string; email?: string }) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token')
      if (storedToken) {
        api.setToken(storedToken)
        const { user } = await api.getMe()
        setUser(user)
        setToken(storedToken)
      }
    } catch (error) {
      console.log('No valid stored auth')
      await AsyncStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password)
      setUser(res.user)
      setToken(res.token)
      await AsyncStorage.setItem('auth_token', res.token)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await api.register(email, password, name)
      setUser(res.user)
      setToken(res.token)
      await AsyncStorage.setItem('auth_token', res.token)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    try {
      const res = await api.socialLogin('google', idToken)
      setUser(res.user)
      setToken(res.token)
      await AsyncStorage.setItem('auth_token', res.token)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Google login failed' }
    }
  }

  const loginWithApple = async (idToken: string) => {
    try {
      const res = await api.socialLogin('apple', idToken)
      setUser(res.user)
      setToken(res.token)
      await AsyncStorage.setItem('auth_token', res.token)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Apple login failed' }
    }
  }

  const logout = async () => {
    api.logout()
    setUser(null)
    setToken(null)
    await AsyncStorage.removeItem('auth_token')
  }

  const updateProfile = async (data: { name?: string; email?: string }) => {
    try {
      const res = await api.updateProfile(data)
      setUser(res.user)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Update failed' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      loginWithApple,
      register,
      logout,
      updateProfile,
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
