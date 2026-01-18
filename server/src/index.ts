import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import ordersRouter from './routes/orders.js'
import webhooksRouter from './routes/webhooks.js'
import adminRouter from './routes/admin.js'
import notificationsRouter from './routes/notifications.js'
import groupsRouter from './routes/groups.js'
import productsRouter from './routes/products.js'
import wishlistRouter from './routes/wishlist.js'
import { createAdminUser } from './users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000', // Next.js dev server
  ],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/webhooks', webhooksRouter)
app.use('/api/admin', adminRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/groups', groupsRouter)
app.use('/api/products', productsRouter)
app.use('/api/wishlist', wishlistRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Create admin user on startup and start server
createAdminUser().then(() => {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
    console.log(`   Tranzilla: ${process.env.TRANZILLA_SUPPLIER ? 'Configured' : 'Mock mode'}`)
  })
})
