export type User = { id: string; email: string; name?: string }

let currentUser: User | null = null

export async function signIn(email: string, password: string): Promise<User> {
  // Mock implementation for dev — replace with real auth server
  currentUser = { id: 'u1', email, name: email.split('@')[0] }
  return Promise.resolve(currentUser)
}

export async function signOut(): Promise<void> {
  currentUser = null
  return Promise.resolve()
}

export function getCurrentUser(): User | null {
  return currentUser
}