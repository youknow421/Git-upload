const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Try to load token from localStorage on init (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async register(data: { email: string; password: string; name: string }) {
    return this.request<{ user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
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

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async verifyResetToken(token: string) {
    return this.request<{ valid: boolean; email?: string }>(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
  }

  async resendVerification() {
    return this.request<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
    })
  }

  async verifyEmail(token: string) {
    return this.request<{ user: User; message: string }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
  }

  async refreshToken() {
    return this.request<{ token: string }>('/api/auth/refresh', {
      method: 'POST',
    })
  }

  //Order
  async createOrder(data: {
    items: Array<{ productId: string; name: string; price: number; quantity: number }>
    total: number
    customerName: string
    customerEmail: string
  }) {
    return this.request<{ order: Order; paymentUrl?: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getOrder(id: string) {
    return this.request<{ order: Order }>(`/api/orders/${id}`)
  }

  async listOrders(email?: string) {
    const query = email ? `?email=${encodeURIComponent(email)}` : ''
    return this.request<{ orders: Order[] }>(`/api/orders${query}`)
  }

  async updateOrderStatus(id: string, status: string, transactionId?: string) {
    return this.request<{ order: Order }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, transactionId }),
    })
  }

  // Products (Note to whoever does this later, you stupid bastard dont forget this is temporary- when backend has product endpoints)
  async getProducts() {
    return this.request<{ products: Product[] }>('/api/products')
  }

  async getProduct(id: string) {
    return this.request<{ product: Product }>(`/api/products/${id}`)
  }

  // Admin - Products
  async createProduct(data: Omit<Product, 'id'>) {
    return this.request<{ product: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string | number, data: Partial<Product>) {
    return this.request<{ product: Product }>(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string | number) {
    return this.request<{ message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    })
  }

  //Admin - Orders
  async getAdminOrders(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    const queryString = query.toString()
    return this.request<{ orders: Order[]; total: number }>(`/api/admin/orders${queryString ? '?' + queryString : ''}`)
  }

  async getAdminOrder(id: string) {
    return this.request<{ order: Order }>(`/api/admin/orders/${id}`)
  }

  // Admin - Customers
  async getCustomers(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    const queryString = query.toString()
    return this.request<{ customers: User[]; total: number }>(`/api/admin/customers${queryString ? '?' + queryString : ''}`)
  }

  async getCustomer(id: string) {
    return this.request<{ customer: User; orders: Order[] }>(`/api/admin/customers/${id}`)
  }

  // Admin - Users (Role Management)
  async getAdminUsers(params?: { role?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams()
    if (params?.role) query.set('role', params.role)
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    const queryString = query.toString()
    return this.request<{ users: User[]; total: number }>(`/api/admin/users${queryString ? '?' + queryString : ''}`)
  }

  async updateUserRole(id: string, role: 'user' | 'admin') {
    return this.request<{ user: User }>(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  }

  // Admin - Dashboard Stats
  async getDashboardStats() {
    return this.request<{
      totalRevenue: number
      ordersToday: number
      pendingOrders: number
      totalProducts: number
      totalCustomers: number
    }>('/api/admin/stats')
  }

  //Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health')
  }

  // Notifications
  async getNotifications(limit?: number) {
    const query = limit ? `?limit=${limit}` : ''
    return this.request<{ notifications: Notification[]; unreadCount: number; total: number }>(`/api/notifications${query}`)
  }

  async getUnreadCount() {
    return this.request<{ unreadCount: number }>('/api/notifications/unread-count')
  }

  async markNotificationRead(id: string) {
    return this.request<{ notification: Notification }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string; count: number }>('/api/notifications/mark-all-read', {
      method: 'POST',
    })
  }

  async deleteNotification(id: string) {
    return this.request<{ message: string }>(`/api/notifications/${id}`, {
      method: 'DELETE',
    })
  }

  // Groups
  async getGroups() {
    return this.request<Group[]>('/api/groups')
  }

  async getGroup(id: string) {
    return this.request<Group>(`/api/groups/${id}`)
  }

  async createGroup(data: { name: string; description?: string; expiresInDays?: number }) {
    return this.request<Group>('/api/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateGroup(id: string, data: Partial<{ name: string; description: string; settings: GroupSettings; expiresAt: string | null }>) {
    return this.request<Group>(`/api/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteGroup(id: string) {
    return this.request<{ success: boolean }>(`/api/groups/${id}`, {
      method: 'DELETE',
    })
  }

  async getGroupActivity(id: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return this.request<GroupActivity[]>(`/api/groups/${id}/activity${params}`)
  }

  // Group Invites
  async sendGroupInvite(groupId: string, email: string) {
    return this.request<GroupInvite>(`/api/groups/${groupId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async getGroupInvites(groupId: string) {
    return this.request<GroupInvite[]>(`/api/groups/${groupId}/invites`)
  }

  async cancelGroupInvite(groupId: string, inviteId: string) {
    return this.request<{ success: boolean }>(`/api/groups/${groupId}/invites/${inviteId}`, {
      method: 'DELETE',
    })
  }

  async getMyPendingInvites() {
    return this.request<PendingInviteInfo[]>('/api/groups/invites/pending')
  }

  async getInviteByToken(token: string) {
    return this.request<InvitePreview>(`/api/groups/invite/${token}`)
  }

  async acceptInvite(token: string) {
    return this.request<Group>(`/api/groups/invite/${token}/accept`, {
      method: 'POST',
    })
  }

  async declineInvite(token: string) {
    return this.request<{ success: boolean }>(`/api/groups/invite/${token}/decline`, {
      method: 'POST',
    })
  }

  // Group Members
  async removeGroupMember(groupId: string, memberId: string) {
    return this.request<{ success: boolean }>(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    })
  }

  async updateGroupMemberRole(groupId: string, memberId: string, role: 'admin' | 'member') {
    return this.request<{ success: boolean }>(`/api/groups/${groupId}/members/${memberId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async transferGroupOwnership(groupId: string, newOwnerId: string) {
    return this.request<{ success: boolean }>(`/api/groups/${groupId}/transfer-ownership`, {
      method: 'POST',
      body: JSON.stringify({ newOwnerId }),
    })
  }

  // Group Shared Cart
  async addToGroupCart(groupId: string, productId: string) {
    return this.request<string[]>(`/api/groups/${groupId}/cart`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  }

  async removeFromGroupCart(groupId: string, productId: string) {
    return this.request<string[]>(`/api/groups/${groupId}/cart/${productId}`, {
      method: 'DELETE',
    })
  }

  // Group Expiration
  async extendGroupExpiration(groupId: string, days: number) {
    return this.request<Group>(`/api/groups/${groupId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    })
  }

  // PRODUCTS & SEARCH

  async searchProducts(params: SearchParams = {}) {
    const query = new URLSearchParams()
    if (params.query) query.set('q', params.query)
    if (params.category) query.set('category', params.category)
    if (params.minPrice !== undefined) query.set('minPrice', params.minPrice.toString())
    if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString())
    if (params.minRating !== undefined) query.set('minRating', params.minRating.toString())
    if (params.inStock) query.set('inStock', 'true')
    if (params.sort) query.set('sort', params.sort)
    if (params.page) query.set('page', params.page.toString())
    if (params.limit) query.set('limit', params.limit.toString())
    const queryString = query.toString()
    return this.request<SearchResult>(`/api/products${queryString ? '?' + queryString : ''}`)
  }

  async getProductCategories() {
    return this.request<{ categories: string[] }>('/api/products/categories')
  }

  async getProductBySlug(slug: string) {
    return this.request<{ product: Product }>(`/api/products/slug/${slug}`)
  }

  // REVIEWS

  async getProductReviews(productId: string) {
    return this.request<ReviewsResponse>(`/api/products/${productId}/reviews`)
  }

  async createReview(productId: string, data: { rating: number; title: string; content: string }) {
    return this.request<{ review: Review }>(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateReview(productId: string, reviewId: string, data: { rating?: number; title?: string; content?: string }) {
    return this.request<{ review: Review }>(`/api/products/${productId}/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteReview(productId: string, reviewId: string) {
    return this.request<{ success: boolean }>(`/api/products/${productId}/reviews/${reviewId}`, {
      method: 'DELETE',
    })
  }

  async markReviewHelpful(productId: string, reviewId: string) {
    return this.request<{ success: boolean }>(`/api/products/${productId}/reviews/${reviewId}/helpful`, {
      method: 'POST',
    })
  }

  //  WISHLIST

  async getWishlist() {
    return this.request<WishlistResponse>('/api/wishlist')
  }

  async addToWishlist(productId: string) {
    return this.request<WishlistResponse>(`/api/wishlist/${productId}`, {
      method: 'POST',
    })
  }

  async removeFromWishlist(productId: string) {
    return this.request<WishlistResponse>(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    })
  }

  async toggleWishlistItem(productId: string) {
    return this.request<WishlistToggleResponse>(`/api/wishlist/${productId}/toggle`, {
      method: 'POST',
    })
  }

  async clearWishlist() {
    return this.request<WishlistResponse>('/api/wishlist', {
      method: 'DELETE',
    })
  }

  async checkWishlistItem(productId: string) {
    return this.request<{ inWishlist: boolean }>(`/api/wishlist/check/${productId}`)
  }

  //  RELATED PRODUCTS

  async getRelatedProducts(productId: string, limit: number = 4) {
    return this.request<{ products: Product[] }>(`/api/products/${productId}/related?limit=${limit}`)
  }

  //  RECENTLY VIEWED 

  async trackProductView(productId: string) {
    return this.request<{ success: boolean }>(`/api/products/${productId}/view`, {
      method: 'POST',
    })
  }

  async getRecentlyViewed(limit: number = 5) {
    return this.request<{ products: Product[] }>(`/api/products/user/recently-viewed?limit=${limit}`)
  }

  // COUPONS 

  async validateCoupon(code: string, orderTotal: number) {
    return this.request<CouponValidationResponse>('/api/products/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderTotal }),
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
  createdAt: string
}

export interface Product {
  id: string | number
  name: string
  slug: string
  price: number
  description: string
  category?: string
  image: string
  stock?: number
  rating?: number
  reviewCount?: number
}

// Search types
export interface SearchParams {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  sort?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}

export interface SearchResult {
  products: Product[]
  total: number
  page: number
  totalPages: number
  query?: string
  filters: {
    categories: string[]
    priceRange: { min: number; max: number }
  }
}

// Review types
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
  updatedAt: string
}

export interface ReviewsResponse {
  reviews: Review[]
  stats: {
    average: number
    count: number
    distribution: Record<number, number>
  }
}

// Wishlist types
export interface WishlistResponse {
  items: Product[]
  count: number
}

export interface WishlistToggleResponse extends WishlistResponse {
  inWishlist: boolean
}

// Coupon types
export interface CouponValidationResponse {
  valid: boolean
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discount: number
  discountFormatted: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'failed' | 'cancelled'
  customerName: string
  customerEmail: string
  paymentSessionId?: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

export type NotificationType = 
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_failed'
  | 'price_drop'
  | 'back_in_stock'
  | 'group_invite'
  | 'group_update'
  | 'promo'
  | 'system'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

// Group Types
export interface GroupMember {
  id: string
  userId: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

export interface GroupInvite {
  id: string
  groupId: string
  email: string
  invitedBy: string
  inviterName: string
  token: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  expiresAt: string
}

export interface GroupSettings {
  allowMemberInvites: boolean
  digestFrequency: 'daily' | 'weekly' | 'none'
  autoExpireDays: number | null
}

export interface Group {
  id: string
  name: string
  description: string
  ownerId: string
  ownerName: string
  members: GroupMember[]
  sharedCart: string[]
  invites: GroupInvite[]
  createdAt: string
  expiresAt: string | null
  isArchived: boolean
  settings: GroupSettings
}

export interface GroupActivity {
  id: string
  groupId: string
  type: 'member_joined' | 'member_left' | 'item_added' | 'item_removed' | 'invite_sent' | 'group_updated'
  userId: string
  userName: string
  details: string
  timestamp: string
}

export interface PendingInviteInfo {
  invite: GroupInvite
  groupName: string
  groupDescription: string
  memberCount: number
}

export interface InvitePreview {
  inviterName: string
  groupName: string
  groupDescription: string
  memberCount: number
  expiresAt: string
}

export const api = new ApiClient(API_BASE)
export default api
