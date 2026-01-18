import express from 'express'
import { requireAuth, AuthenticatedRequest } from '../auth.js'
import * as users from '../users.js'
import * as db from '../db.js'
import * as notifications from '../notifications.js'
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from '../email.js'

const router = express.Router()

// In-memory product storage (for demo - in production use a database)
let products: any[] = [
  { id: '1', name: 'Wireless Headphones', description: 'High-quality wireless headphones with noise cancellation', price: 199.99, category: 'Electronics', stock: 50, image: '' },
  { id: '2', name: 'Smart Watch', description: 'Feature-rich smartwatch with health monitoring', price: 299.99, category: 'Electronics', stock: 30, image: '' },
  { id: '3', name: 'Laptop Stand', description: 'Ergonomic aluminum laptop stand', price: 49.99, category: 'Electronics', stock: 100, image: '' },
  { id: '4', name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI and card reader', price: 79.99, category: 'Electronics', stock: 75, image: '' },
  { id: '5', name: 'Mechanical Keyboard', description: 'RGB mechanical gaming keyboard', price: 149.99, category: 'Electronics', stock: 25, image: '' },
]

// Simple admin check middleware (in production, check user.role === 'admin')
const isAdmin = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' })
  }
  next()
}

// Dashboard Stats
router.get('/stats', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const allOrders = db.listOrders()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = {
    totalRevenue: allOrders.reduce((sum, o) => sum + o.total, 0),
    ordersToday: allOrders.filter(o => new Date(o.createdAt) >= today).length,
    pendingOrders: allOrders.filter(o => o.status === 'pending').length,
    totalProducts: products.length,
    totalCustomers: users.getUserCount(),
  }

  res.json(stats)
})

// Orders Management
router.get('/orders', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const { status, page = '1', limit = '50' } = req.query
  let allOrders = db.listOrders()

  if (status && status !== 'all') {
    allOrders = allOrders.filter(o => o.status === status)
  }

  // Sort by date descending
  allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const start = (pageNum - 1) * limitNum
  const paginatedOrders = allOrders.slice(start, start + limitNum)

  res.json({
    orders: paginatedOrders,
    total: allOrders.length,
    page: pageNum,
    limit: limitNum,
  })
})

router.get('/orders/:id', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const order = db.getOrder(req.params.id)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  res.json({ order })
})

router.patch('/orders/:id/status', requireAuth, isAdmin, async (req: AuthenticatedRequest, res) => {
  const { status, transactionId, trackingNumber } = req.body
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  const order = db.updateOrderStatus(req.params.id, status, transactionId)
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }

  // Send notifications based on status change
  const user = users.getUserByEmail(order.customerEmail)
  
  if (status === 'shipped') {
    // Send shipped email
    sendOrderShippedEmail(
      order.customerEmail,
      order.customerName,
      order.orderNumber,
      trackingNumber
    ).catch(err => console.error('Failed to send shipped email:', err))
    
    // In-app notification
    if (user) {
      notifications.notifyOrderShipped(user.id, order.orderNumber, trackingNumber)
    }
  } else if (status === 'delivered') {
    // Send delivered email
    sendOrderDeliveredEmail(
      order.customerEmail,
      order.customerName,
      order.orderNumber
    ).catch(err => console.error('Failed to send delivered email:', err))
    
    // In-app notification
    if (user) {
      notifications.notifyOrderDelivered(user.id, order.orderNumber)
    }
  } else if (status === 'cancelled') {
    // In-app notification
    if (user) {
      notifications.notifyOrderCancelled(user.id, order.orderNumber)
    }
  }

  res.json({ order })
})

// Products Management
router.get('/products', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ products, total: products.length })
})

router.get('/products/:id', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const product = products.find(p => p.id === req.params.id)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json({ product })
})

router.post('/products', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const { name, description, price, category, stock, image } = req.body

  if (!name || !description || price === undefined || !category) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const newProduct = {
    id: Date.now().toString(),
    name,
    description,
    price: parseFloat(price),
    category,
    stock: stock ? parseInt(stock) : 0,
    image: image || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  products.push(newProduct)
  res.status(201).json({ product: newProduct })
})

router.patch('/products/:id', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const index = products.findIndex(p => p.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const { name, description, price, category, stock, image } = req.body
  const product = products[index]

  products[index] = {
    ...product,
    name: name ?? product.name,
    description: description ?? product.description,
    price: price !== undefined ? parseFloat(price) : product.price,
    category: category ?? product.category,
    stock: stock !== undefined ? parseInt(stock) : product.stock,
    image: image ?? product.image,
    updatedAt: new Date().toISOString(),
  }

  res.json({ product: products[index] })
})

router.delete('/products/:id', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const index = products.findIndex(p => p.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const deleted = products.splice(index, 1)[0]
  res.json({ message: 'Product deleted', product: deleted })
})

// Customers Management
router.get('/customers', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const { page = '1', limit = '50' } = req.query
  const allCustomers = users.getAllUsers()

  // Sort by creation date descending
  allCustomers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const start = (pageNum - 1) * limitNum
  const paginatedCustomers = allCustomers.slice(start, start + limitNum)

  res.json({
    customers: paginatedCustomers,
    total: allCustomers.length,
    page: pageNum,
    limit: limitNum,
  })
})

router.get('/customers/:id', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const customer = users.getPublicUserById(req.params.id)
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' })
  }

  // Get customer orders
  const customerOrders = db.listOrders(customer.email)

  res.json({
    customer,
    orders: customerOrders,
  })
})

// User Role Management
router.get('/users', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const { page = '1', limit = '50', role, search } = req.query
  let allUsers = users.getAllUsers()

  // Filter by role
  if (role && role !== 'all') {
    allUsers = allUsers.filter(u => u.role === role)
  }

  // Search by name or email
  if (search) {
    const searchLower = (search as string).toLowerCase()
    allUsers = allUsers.filter(u => 
      u.name.toLowerCase().includes(searchLower) || 
      u.email.toLowerCase().includes(searchLower)
    )
  }

  // Sort by creation date descending
  allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const start = (pageNum - 1) * limitNum
  const paginatedUsers = allUsers.slice(start, start + limitNum)

  res.json({
    users: paginatedUsers,
    total: allUsers.length,
    page: pageNum,
    limit: limitNum,
  })
})

router.patch('/users/:id/role', requireAuth, isAdmin, (req: AuthenticatedRequest, res) => {
  const { role } = req.body
  
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  // Prevent demoting yourself
  if (req.user?.id === req.params.id && role !== 'admin') {
    return res.status(400).json({ error: "You can't change your own role" })
  }

  const user = users.updateUserRole(req.params.id, role)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({ user })
})

export default router
