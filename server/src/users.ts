// In memory user database with file persist
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

export type UserRole = 'user' | 'admin'

export type AuthProvider = 'email' | 'google' | 'apple'

export interface User {
  id: string
  email: string
  passwordHash: string | null  // null for social auth users
  name: string
  role: UserRole
  emailVerified: boolean
  authProvider: AuthProvider
  providerUserId: string | null  // ID from Google/Apple
  avatarUrl: string | null
  verificationToken: string | null
  verificationTokenExpiry: Date | null
  resetToken: string | null
  resetTokenExpiry: Date | null
  createdAt: Date
  updatedAt: Date
}

export type PublicUser = Omit<User, 'passwordHash' | 'verificationToken' | 'verificationTokenExpiry' | 'resetToken' | 'resetTokenExpiry' | 'providerUserId'>

// Data file path
const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

// In memory store (synced with file)
const users = new Map<string, User>()
const emailIndex = new Map<string, string>() // email -> id
const providerIndex = new Map<string, string>() // provider:providerUserId -> userId
const verificationTokenIndex = new Map<string, string>() // token -> userId
const resetTokenIndex = new Map<string, string>() // resetToken -> userId

// File persist

interface StoredUser {
  id: string
  email: string
  passwordHash: string | null
  name: string
  role: UserRole
  emailVerified: boolean
  authProvider: AuthProvider
  providerUserId: string | null
  avatarUrl: string | null
  verificationToken: string | null
  verificationTokenExpiry: string | null
  resetToken: string | null
  resetTokenExpiry: string | null
  createdAt: string
  updatedAt: string
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function saveUsers(): void {
  ensureDataDir()
  const usersArray: StoredUser[] = Array.from(users.values()).map(user => ({
    ...user,
    verificationTokenExpiry: user.verificationTokenExpiry?.toISOString() || null,
    resetTokenExpiry: user.resetTokenExpiry?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }))
  fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2))
}

function loadUsers(): void {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    console.log('No users file found, starting fresh')
    return
  }

  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    const usersArray: StoredUser[] = JSON.parse(data)
    
    users.clear()
    emailIndex.clear()
    providerIndex.clear()
    verificationTokenIndex.clear()
    resetTokenIndex.clear()

    for (const stored of usersArray) {
      const user: User = {
        ...stored,
        authProvider: stored.authProvider || 'email',
        providerUserId: stored.providerUserId || null,
        avatarUrl: stored.avatarUrl || null,
        verificationTokenExpiry: stored.verificationTokenExpiry ? new Date(stored.verificationTokenExpiry) : null,
        resetTokenExpiry: stored.resetTokenExpiry ? new Date(stored.resetTokenExpiry) : null,
        createdAt: new Date(stored.createdAt),
        updatedAt: new Date(stored.updatedAt),
      }
      
      users.set(user.id, user)
      emailIndex.set(user.email, user.id)
      
      if (user.authProvider !== 'email' && user.providerUserId) {
        providerIndex.set(`${user.authProvider}:${user.providerUserId}`, user.id)
      }
      if (user.verificationToken) {
        verificationTokenIndex.set(user.verificationToken, user.id)
      }
      if (user.resetToken) {
        resetTokenIndex.set(user.resetToken, user.id)
      }
    }
    
    console.log(`Loaded ${users.size} users from file`)
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

// Load users
loadUsers()

export function generateUserId(): string {
  return `usr_${Date.now()}_${uuidv4().slice(0, 8)}`
}

export function generateVerificationToken(): string {
  return `vrf_${uuidv4()}`
}

export function generateResetToken(): string {
  return `rst_${uuidv4()}`
}

export interface CreateUserResult {
  user: PublicUser
  verificationToken: string
}

export async function createUser(data: {
  email: string
  password: string
  name: string
}): Promise<CreateUserResult> {
  const normalizedEmail = data.email.toLowerCase().trim()
  
  // Check if email already exists
  if (emailIndex.has(normalizedEmail)) {
    throw new Error('Email already registered')
  }

  const passwordHash = await bcrypt.hash(data.password, 12)
  const verificationToken = generateVerificationToken()
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  
  const user: User = {
    id: generateUserId(),
    email: normalizedEmail,
    passwordHash,
    name: data.name.trim(),
    role: 'user',
    emailVerified: false,
    authProvider: 'email',
    providerUserId: null,
    avatarUrl: null,
    verificationToken,
    verificationTokenExpiry,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  users.set(user.id, user)
  emailIndex.set(normalizedEmail, user.id)
  verificationTokenIndex.set(verificationToken, user.id)
  
  // Persistfile
  saveUsers()

  return { user: toPublicUser(user), verificationToken }
}

// Social Auth: Create or get user by provider
export interface SocialAuthData {
  provider: AuthProvider
  providerUserId: string
  email: string
  name: string
  avatarUrl?: string
}

export function findOrCreateSocialUser(data: SocialAuthData): PublicUser {
  const providerKey = `${data.provider}:${data.providerUserId}`
  
  // Check if user exists by provider ID
  const existingUserId = providerIndex.get(providerKey)
  if (existingUserId) {
    const existingUser = users.get(existingUserId)
    if (existingUser) {
      // Update avatar if changed
      if (data.avatarUrl && existingUser.avatarUrl !== data.avatarUrl) {
        existingUser.avatarUrl = data.avatarUrl
        existingUser.updatedAt = new Date()
        users.set(existingUserId, existingUser)
        saveUsers()
      }
      return toPublicUser(existingUser)
    }
  }
  
  const normalizedEmail = data.email.toLowerCase().trim()
  
  // Check if user exists by email (maybe they registered with email first)
  const emailUserId = emailIndex.get(normalizedEmail)
  if (emailUserId) {
    const existingUser = users.get(emailUserId)
    if (existingUser) {
      // Link social account to existing user
      existingUser.authProvider = data.provider
      existingUser.providerUserId = data.providerUserId
      existingUser.avatarUrl = data.avatarUrl || existingUser.avatarUrl
      existingUser.emailVerified = true // Social auth verifies email
      existingUser.updatedAt = new Date()
      users.set(emailUserId, existingUser)
      providerIndex.set(providerKey, emailUserId)
      saveUsers()
      return toPublicUser(existingUser)
    }
  }
  
  // Create new user
  const user: User = {
    id: generateUserId(),
    email: normalizedEmail,
    passwordHash: null, // No password for social auth
    name: data.name,
    role: 'user',
    emailVerified: true, // Social auth verifies email
    authProvider: data.provider,
    providerUserId: data.providerUserId,
    avatarUrl: data.avatarUrl || null,
    verificationToken: null,
    verificationTokenExpiry: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  users.set(user.id, user)
  emailIndex.set(normalizedEmail, user.id)
  providerIndex.set(providerKey, user.id)
  saveUsers()
  
  return toPublicUser(user)
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.passwordHash) return false // Social auth user
  return bcrypt.compare(password, user.passwordHash)
}

export function getUserById(id: string): User | undefined {
  return users.get(id)
}

export function getUserByEmail(email: string): User | undefined {
  const normalizedEmail = email.toLowerCase().trim()
  const userId = emailIndex.get(normalizedEmail)
  if (!userId) return undefined
  return users.get(userId)
}

export function updateUser(id: string, data: Partial<Pick<User, 'name' | 'email'>>): PublicUser | undefined {
  const user = users.get(id)
  if (!user) return undefined

  if (data.name) {
    user.name = data.name.trim()
  }

  if (data.email && data.email !== user.email) {
    const normalizedEmail = data.email.toLowerCase().trim()
    if (emailIndex.has(normalizedEmail)) {
      throw new Error('Email already in use')
    }
    emailIndex.delete(user.email)
    user.email = normalizedEmail
    emailIndex.set(normalizedEmail, user.id)
  }

  user.updatedAt = new Date()
  users.set(id, user)
  saveUsers()

  return toPublicUser(user)
}

export async function changePassword(id: string, newPassword: string): Promise<boolean> {
  const user = users.get(id)
  if (!user) return false

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  user.updatedAt = new Date()
  users.set(id, user)
  saveUsers()

  return true
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, verificationToken, verificationTokenExpiry, resetToken, resetTokenExpiry, providerUserId, ...publicUser } = user
  return publicUser
}

export function verifyEmail(token: string): PublicUser | null {
  const userId = verificationTokenIndex.get(token)
  if (!userId) return null
  
  const user = users.get(userId)
  if (!user) return null
  
  // Check if token has expired
  if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
    return null
  }
  
  // Mark email as verified
  user.emailVerified = true
  user.verificationToken = null
  user.verificationTokenExpiry = null
  user.updatedAt = new Date()
  users.set(userId, user)
  
  // Clean up token index
  verificationTokenIndex.delete(token)
  saveUsers()
  
  return toPublicUser(user)
}

export function regenerateVerificationToken(userId: string): string | null {
  const user = users.get(userId)
  if (!user) return null
  
  // Delete old token from index
  if (user.verificationToken) {
    verificationTokenIndex.delete(user.verificationToken)
  }
  
  // Generate new token
  const verificationToken = generateVerificationToken()
  user.verificationToken = verificationToken
  user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  user.updatedAt = new Date()
  users.set(userId, user)
  
  verificationTokenIndex.set(verificationToken, userId)
  saveUsers()
  
  return verificationToken
}

// Password Reset Functions
export function createPasswordResetToken(email: string): { token: string; user: User } | null {
  const normalizedEmail = email.toLowerCase().trim()
  const userId = emailIndex.get(normalizedEmail)
  if (!userId) return null
  
  const user = users.get(userId)
  if (!user) return null
  
  // Delete old reset token if exists
  if (user.resetToken) {
    resetTokenIndex.delete(user.resetToken)
  }
  
  const resetToken = generateResetToken()
  user.resetToken = resetToken
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  user.updatedAt = new Date()
  users.set(userId, user)
  
  resetTokenIndex.set(resetToken, userId)
  saveUsers()
  
  return { token: resetToken, user }
}

export function verifyResetToken(token: string): User | null {
  const userId = resetTokenIndex.get(token)
  if (!userId) return null
  
  const user = users.get(userId)
  if (!user) return null
  
  // Check if token has expired
  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    // Clean up expired token
    resetTokenIndex.delete(token)
    user.resetToken = null
    user.resetTokenExpiry = null
    users.set(userId, user)
    return null
  }
  
  return user
}

export async function resetPassword(token: string, newPassword: string): Promise<PublicUser | null> {
  const user = verifyResetToken(token)
  if (!user) return null
  
  // Update password
  user.passwordHash = await bcrypt.hash(newPassword, 12)
  user.resetToken = null
  user.resetTokenExpiry = null
  user.updatedAt = new Date()
  users.set(user.id, user)
  
  // Clean up token index
  resetTokenIndex.delete(token)
  saveUsers()
  
  return toPublicUser(user)
}

export function deleteUser(id: string): boolean {
  const user = users.get(id)
  if (!user) return false

  emailIndex.delete(user.email)
  users.delete(id)
  saveUsers()
  return true
}
// Admin helper functions
export function getUserCount(): number {
  return users.size
}

export function getAllUsers(): PublicUser[] {
  return Array.from(users.values()).map(toPublicUser)
}

export function getPublicUserById(id: string): PublicUser | null {
  const user = users.get(id)
  return user ? toPublicUser(user) : null
}

export function updateUserRole(id: string, role: UserRole): PublicUser | null {
  const user = users.get(id)
  if (!user) return null
  
  user.role = role
  user.updatedAt = new Date()
  users.set(id, user)
  saveUsers()
  
  return toPublicUser(user)
}

export function isAdmin(id: string): boolean {
  const user = users.get(id)
  return user?.role === 'admin'
}

// Create an initial admin user for testing (remove in production wink wink nudge nudge as if this is a real production)
export async function createAdminUser(): Promise<void> {
  const adminEmail = 'admin@example.com'
  if (!emailIndex.has(adminEmail)) {
    const passwordHash = await bcrypt.hash('admin123', 12)
    const admin: User = {
      id: generateUserId(),
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'admin',
      emailVerified: true,
      authProvider: 'email',
      providerUserId: null,
      avatarUrl: null,
      verificationToken: null,
      verificationTokenExpiry: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    users.set(admin.id, admin)
    emailIndex.set(adminEmail, admin.id)
    saveUsers()
    console.log('Created admin user: admin@example.com / admin123')
  }
}