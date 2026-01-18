import { Platform } from 'react-native'

// Auto-detect platform for API URL
const getApiBase = () => {
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host localhost (I love how specific it is)
    return 'http://10.0.2.2:3001'
  }
  // iOS simulator and web can use localhost
  return 'http://localhost:3001'
}

const API_BASE = getApiBase()

class MobileApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  getToken() {
    return this.token
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    this.token = res.token
    return res
  }

  async register(email: string, password: string, name: string) {
    const res = await this.request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    this.token = res.token
    return res
  }

  async socialLogin(provider: 'google' | 'apple', idToken: string) {
    const res = await this.request<{ user: User; token: string }>('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify({ provider, idToken }),
    })
    this.token = res.token
    return res
  }

  async getMe() {
    return this.request<{ user: User }>('/api/auth/me')
  }

  async updateProfile(data: { name?: string; email?: string }) {
    return this.request<{ user: User }>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  logout() {
    this.token = null
  }

  // Products
  async getProducts(params?: { category?: string; sort?: string; page?: number }) {
    const query = new URLSearchParams()
    if (params?.category) query.set('category', params.category)
    if (params?.sort) query.set('sort', params.sort)
    if (params?.page) query.set('page', params.page.toString())
    return this.request<SearchResult>(`/api/products?${query}`)
  }

  async getProduct(id: string) {
    return this.request<{ product: Product }>(`/api/products/${id}`)
  }

  async getProductBySlug(slug: string) {
    return this.request<{ product: Product }>(`/api/products/slug/${slug}`)
  }

  async getCategories() {
    return this.request<{ categories: string[] }>('/api/products/categories')
  }

  async searchProducts(query: string) {
    return this.request<SearchResult>(`/api/products?q=${encodeURIComponent(query)}`)
  }

  // Reviews
  async getProductReviews(productId: string) {
    return this.request<ReviewsResponse>(`/api/products/${productId}/reviews`)
  }

  async createReview(productId: string, data: { rating: number; title: string; content: string }) {
    return this.request<{ review: Review }>(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Wishlist
  async getWishlist() {
    return this.request<{ items: Product[]; count: number }>('/api/wishlist')
  }

  async toggleWishlistItem(productId: string) {
    return this.request<{ items: Product[]; count: number; inWishlist: boolean }>(`/api/wishlist/${productId}/toggle`, {
      method: 'POST',
    })
  }

  // Cart/Orders
  async createOrder(data: {
    items: { productId: string; name: string; price: number; quantity: number }[]
    total: number
    customerName: string
    customerEmail: string
  }) {
    return this.request<{ order: Order; paymentUrl?: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getOrders() {
    return this.request<{ orders: Order[] }>('/api/orders')
  }

  async getOrder(id: string) {
    return this.request<{ order: Order }>(`/api/orders/${id}`)
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: Notification[] }>('/api/notifications')
  }

  async markNotificationRead(id: string) {
    return this.request<{ notification: Notification }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    })
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
    })
  }

  // Groups
  async getGroups() {
    return this.request<{ groups: Group[] }>('/api/groups')
  }

  async createGroup(name: string, description: string) {
    return this.request<{ group: Group }>('/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })
  }
}

// Types
export interface User {
  id: string
  email: string
  name: string
  role?: 'user' | 'admin'
  emailVerified: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  description: string
  image: string
  category: string
  stock: number
  rating: number
  reviewCount: number
}

export interface SearchResult {
  products: Product[]
  total: number
  page: number
  totalPages: number
  filters: {
    categories: string[]
    priceRange: { min: number; max: number }
  }
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  verified: boolean
  helpful: number
  createdAt: string
}

export interface ReviewsResponse {
  reviews: Review[]
  stats: {
    average: number
    count: number
    distribution: Record<number, number>
  }
}

export interface Order {
  id: string
  orderNumber: string
  items: { productId: string; name: string; price: number; quantity: number }[]
  total: number
  status: string
  customerName: string
  customerEmail: string
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface Group {
  id: string
  name: string
  description: string
  members: { id: string; name: string; email: string; role: string }[]
}

export const api = new MobileApiClient()
export default api
