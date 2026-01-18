// API client for backend communication
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
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

  // Orders
  async createOrder(data) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getOrder(id) {
    return this.request(`/api/orders/${id}`)
  }

  async listOrders(email) {
    const query = email ? `?email=${encodeURIComponent(email)}` : ''
    return this.request(`/api/orders${query}`)
  }

  async updateOrderStatus(id, status, transactionId) {
    return this.request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, transactionId }),
    })
  }

  // Webhooks (for mock payments in development)
  async mockWebhook(orderId, status) {
    return this.request('/api/webhooks/mock', {
      method: 'POST',
      body: JSON.stringify({ orderId, status }),
    })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export const api = new ApiClient(API_BASE)
export default api
