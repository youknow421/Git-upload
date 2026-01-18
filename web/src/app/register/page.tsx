'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import SocialLoginButtons from '@/components/SocialLoginButtons'

export default function RegisterPage() {
  const router = useRouter()
  const { register, error, clearError } = useAuth()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
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
      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    }
  }

  function handleSocialSuccess() {
    router.push('/')
  }

  function handleSocialError(errorMsg: string) {
    setLocalError(errorMsg)
  }

  const displayError = localError || error

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="card p-8">
          <span className="text-6xl block mb-4">📧</span>
          <h1 className="text-2xl font-bold text-green-600 mb-4">Account Created!</h1>
          <p className="text-gray-600 mb-4">
            We've sent a verification email to <strong>{email}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Please check your inbox and click the verification link.
          </p>
          <p className="text-gray-400 text-sm">Redirecting to home...</p>
          <Link href="/" className="btn btn-primary mt-4 inline-block">
            Go to Home Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h1>
        
        {displayError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
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
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Confirm your password"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <SocialLoginButtons 
          onSuccess={handleSocialSuccess}
          onError={handleSocialError}
        />

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
