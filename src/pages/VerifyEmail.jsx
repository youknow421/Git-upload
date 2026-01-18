import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyEmail, isAuthenticated } = useAuth()
  
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    async function verify() {
      const result = await verifyEmail(token)
      
      if (result.success) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
        // Redirect to home after 3 seconds
        setTimeout(() => navigate('/'), 3000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Verification failed')
      }
    }

    verify()
  }, [token, verifyEmail, navigate])

  return (
    <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      {status === 'verifying' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h1 style={{ marginBottom: '10px' }}>Verifying your email...</h1>
          <p style={{ color: '#666' }}>Please wait while we verify your email address.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ marginBottom: '10px', color: '#059669' }}>Email Verified!</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>{message}</p>
          <p style={{ color: '#999', fontSize: '14px' }}>Redirecting you to the home page...</p>
          <Link 
            to="/" 
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4F46E5',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Go to Home Now
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h1 style={{ marginBottom: '10px', color: '#DC2626' }}>Verification Failed</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>{message}</p>
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
            The verification link may have expired or already been used.
          </p>
          {isAuthenticated ? (
            <Link 
              to="/profile" 
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#4F46E5',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px'
              }}
            >
              Go to Profile to Resend
            </Link>
          ) : (
            <Link 
              to="/login" 
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#4F46E5',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px'
              }}
            >
              Log in to Resend
            </Link>
          )}
        </>
      )}
    </div>
  )
}
