'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

// Google Client ID - set this in .env.local as NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

interface SocialLoginButtonsProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function SocialLoginButtons({ onSuccess, onError }: SocialLoginButtonsProps) {
  const { loginWithGoogle, loginWithApple } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)

  // Load Google Sign-In SDK
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        })
        setGoogleReady(true)
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  async function handleGoogleCallback(response: { credential: string }) {
    setGoogleLoading(true)
    try {
      const result = await loginWithGoogle(response.credential)
      if (result.success) {
        onSuccess?.()
      } else {
        onError?.(result.error || 'Google login failed')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  function handleGoogleClick() {
    if (!googleReady || !window.google) {
      onError?.('Google Sign-In is not ready. Please try again.')
      return
    }
    
    window.google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: Show the one-tap UI manually
        const parent = document.getElementById('google-signin-button')
        if (parent) {
          window.google.accounts.id.renderButton(parent, {
            theme: 'outline',
            size: 'large',
            width: '100%',
          })
        }
      }
    })
  }

  async function handleAppleClick() {

    onError?.('Apple Sign In coming soon!')
  }

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={googleLoading || (!GOOGLE_CLIENT_ID && !googleReady)}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-700 font-medium">
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </button>
      
      {/* Hidden container for Google button fallback */}
      <div id="google-signin-button" className="hidden"></div>

      {/* Apple Sign In */}
      <button
        type="button"
        onClick={handleAppleClick}
        disabled={appleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        <span className="font-medium">
          {appleLoading ? 'Signing in...' : 'Continue with Apple'}
        </span>
      </button>

      {!GOOGLE_CLIENT_ID && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local to enable Google Sign-In
        </p>
      )}
    </div>
  )
}

// Type declarations for Google Sign-In
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          prompt: (callback: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
          renderButton: (parent: HTMLElement, options: { theme: string; size: string; width?: string }) => void
        }
      }
    }
  }
}
