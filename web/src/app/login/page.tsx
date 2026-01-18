'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import SocialLoginButtons from '@/components/SocialLoginButtons'

export default function LoginPage() {
  const router = useRouter()
  const { login, error, clearError } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialError, setSocialError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    setSocialError('')
    setLoading(true)

    const result = await login(email, password)
    
    setLoading(false)
    if (result.success) {
      router.push('/')
    }
  }

  function handleSocialSuccess() {
    router.push('/')
  }

  function handleSocialError(error: string) {
    setSocialError(error)
  }

  const displayError = error || socialError

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h1>
        
        {displayError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="password" className="label">Password</label>
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <SocialLoginButtons 
          onSuccess={handleSocialSuccess}
          onError={handleSocialError}
        />

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
