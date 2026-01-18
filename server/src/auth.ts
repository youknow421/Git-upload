import jwt, { SignOptions } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { getUserById, type PublicUser } from './users.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JwtPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export interface AuthenticatedRequest extends Request {
  user?: PublicUser
  userId?: string
}

export function generateToken(user: PublicUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// Middleware: Require authentication
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  const user = getUserById(payload.userId)
  if (!user) {
    res.status(401).json({ error: 'User not found' })
    return
  }

  const { passwordHash, ...publicUser } = user
  req.user = publicUser
  req.userId = user.id
  next()
}

// Middleware: Optional authentication (doesn't fail if no token)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const payload = verifyToken(token)

    if (payload) {
      const user = getUserById(payload.userId)
      if (user) {
        const { passwordHash, ...publicUser } = user
        req.user = publicUser
        req.userId = user.id
      }
    }
  }

  next()
}

// Token refresh
export function refreshToken(oldToken: string): string | null {
  const payload = verifyToken(oldToken)
  if (!payload) return null

  const user = getUserById(payload.userId)
  if (!user) return null

  const { passwordHash, ...publicUser } = user
  return generateToken(publicUser)
}
