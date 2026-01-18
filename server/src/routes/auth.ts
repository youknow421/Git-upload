import { Router, Request, Response } from 'express'
import * as users from '../users.js'
import { generateToken, requireAuth, refreshToken, type AuthenticatedRequest } from '../auth.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../email.js'

const router = Router()

// Google OAuth token verification
async function verifyGoogleToken(idToken: string): Promise<{ email: string; name: string; sub: string; picture?: string } | null> {
  try {
    // Verify with Google's tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    if (!response.ok) return null
    
    const data = await response.json()
    
    // Verify the token is for our app (in production, check aud matches your client ID)
    if (!data.email || !data.sub) return null
    
    return {
      email: data.email,
      name: data.name || data.email.split('@')[0],
      sub: data.sub,
      picture: data.picture
    }
  } catch (error) {
    console.error('Google token verification error:', error)
    return null
  }
}

// Social authentication (Google/Apple)
router.post('/social', async (req: Request, res: Response) => {
  try {
    const { provider, idToken } = req.body

    if (!provider || !idToken) {
      res.status(400).json({ error: 'Provider and ID token are required' })
      return
    }

    if (!['google', 'apple'].includes(provider)) {
      res.status(400).json({ error: 'Invalid provider. Use "google" or "apple"' })
      return
    }

    let socialData: { email: string; name: string; sub: string; picture?: string } | null = null

    if (provider === 'google') {
      socialData = await verifyGoogleToken(idToken)
    } else if (provider === 'apple') {
      try {
        const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString())
        if (decoded.email && decoded.sub) {
          socialData = {
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            sub: decoded.sub
          }
        }
      } catch {
        res.status(401).json({ error: 'Invalid Apple token' })
        return
      }
    }

    if (!socialData) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    // Find or create user
    const user = users.findOrCreateSocialUser({
      provider: provider as 'google' | 'apple',
      providerUserId: socialData.sub,
      email: socialData.email,
      name: socialData.name,
      avatarUrl: socialData.picture
    })

    const token = generateToken(user)

    res.json({
      user,
      token,
      message: 'Authentication successful'
    })
  } catch (error) {
    console.error('Social auth error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' })
      return
    }

    const { user, verificationToken } = await users.createUser({ email, password, name })
    const token = generateToken(user)

    // Send verification email
    await sendVerificationEmail(email, verificationToken, name)

    res.status(201).json({
      user,
      token,
      message: 'Registration successful. Please check your email to verify your account.',
    })
  } catch (error: any) {
    if (error.message === 'Email already registered') {
      res.status(409).json({ error: error.message })
      return
    }
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const user = users.getUserByEmail(email)
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const isValid = await users.verifyPassword(user, password)
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const publicUser = users.toPublicUser(user)
    const token = generateToken(publicUser)

    res.json({
      user: publicUser,
      token,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Verify email
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Verification token is required' })
      return
    }

    const user = users.verifyEmail(token)
    if (!user) {
      res.status(400).json({ error: 'Invalid or expired verification token' })
      return
    }

    res.json({
      user,
      message: 'Email verified successfully',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({ error: 'Email verification failed' })
  }
})

// Resend verification email
router.post('/resend-verification', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = users.getUserById(req.userId!)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    if (user.emailVerified) {
      res.status(400).json({ error: 'Email is already verified' })
      return
    }

    const newToken = users.regenerateVerificationToken(req.userId!)
    if (!newToken) {
      res.status(500).json({ error: 'Failed to generate verification token' })
      return
    }

    await sendVerificationEmail(user.email, newToken, user.name)

    res.json({ message: 'Verification email sent' })
  } catch (error) {
    console.error('Resend verification error:', error)
    res.status(500).json({ error: 'Failed to resend verification email' })
  }
})

// Get current user
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user })
})

// Update profile
router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email } = req.body

    if (!name && !email) {
      res.status(400).json({ error: 'Nothing to update' })
      return
    }

    const updated = users.updateUser(req.userId!, { name, email })
    if (!updated) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user: updated, message: 'Profile updated' })
  } catch (error: any) {
    if (error.message === 'Email already in use') {
      res.status(409).json({ error: error.message })
      return
    }
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Update failed' })
  }
})

// Change password
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' })
      return
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' })
      return
    }

    const user = users.getUserById(req.userId!)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const isValid = await users.verifyPassword(user, currentPassword)
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' })
      return
    }

    await users.changePassword(req.userId!, newPassword)
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Password change failed' })
  }
})

// Refresh token
router.post('/refresh', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token required' })
    return
  }

  const token = authHeader.slice(7)
  const newToken = refreshToken(token)

  if (!newToken) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  res.json({ token: newToken })
})

// Logout (client-side - just for API consistency)
router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' })
})

// Forgot password - request reset email
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ error: 'Email is required' })
      return
    }

    // Always respond with success to prevent email enumeration
    const result = users.createPasswordResetToken(email)
    
    if (result) {
      await sendPasswordResetEmail(result.user.email, result.token, result.user.name)
    }

    // Same response whether email exists or not
    res.json({ 
      message: 'If an account exists with that email, you will receive a password reset link.' 
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
})

// Verify reset token
router.get('/verify-reset-token', (req: Request, res: Response) => {
  const { token } = req.query

  if (!token || typeof token !== 'string') {
    res.status(400).json({ error: 'Reset token is required', valid: false })
    return
  }

  const user = users.verifyResetToken(token)
  
  if (!user) {
    res.status(400).json({ error: 'Invalid or expired reset token', valid: false })
    return
  }

  res.json({ valid: true, email: user.email })
})

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }

    const user = await users.resetPassword(token, password)
    
    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' })
      return
    }

    res.json({ 
      message: 'Password reset successfully. You can now log in with your new password.',
      user 
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Password reset failed' })
  }
})

export default router
