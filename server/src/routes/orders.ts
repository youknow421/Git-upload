import { Router, Request, Response } from 'express'
import * as db from '../db.js'
import { loadTranzillaConfig, createTranzillaSession, createMockSession } from '../payments.js'
import { sendOrderConfirmationEmail, sendOrderShippedEmail, sendOrderDeliveredEmail } from '../email.js'
import * as notifications from '../notifications.js'
import { getUserByEmail } from '../users.js'

const router = Router()

// Create order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { items, total, customerName, customerEmail } = req.body

    if (!items?.length || !total || !customerName || !customerEmail) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const order = db.createOrder({
      items,
      total,
      customerName,
      customerEmail,
    })

    // Create payment session
    const config = loadTranzillaConfig()
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    
    const paymentReq = {
      orderId: order.id,
      amount: total / 100, // convert cents to dollars
      description: `Order ${order.orderNumber}`,
      customerName,
      customerEmail,
      successUrl: `${frontendUrl}/checkout/success?orderId=${order.id}`,
      cancelUrl: `${frontendUrl}/checkout/cancel?orderId=${order.id}`,
    }

    const session = config 
      ? createTranzillaSession(paymentReq, config)
      : createMockSession(paymentReq)

    db.setPaymentSession(order.id, session.sessionId)

    res.status(201).json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        items: order.items,
        createdAt: order.createdAt,
      },
      payment: {
        sessionId: session.sessionId,
        url: session.url,
        payload: session.payload,
        isMock: !config,
      },
    })

    // Send order confirmation email (async, don't block response)
    sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      order.orderNumber,
      items,
      total / 100
    ).catch(err => console.error('Failed to send order confirmation:', err))

    // Create in-app notification if user exists
    const user = getUserByEmail(customerEmail)
    if (user) {
      notifications.notifyOrderConfirmed(user.id, order.orderNumber, total / 100)
    }
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = db.getOrder(req.params.id)
    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }
    res.json({ order })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to get order' })
  }
})

// List orders (optionally filter by email)
router.get('/', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string | undefined
    const orders = db.listOrders(email)
    res.json({ orders })
  } catch (error) {
    console.error('List orders error:', error)
    res.status(500).json({ error: 'Failed to list orders' })
  }
})

// Update order status (admin endpoint)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, transactionId } = req.body
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled']
    
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' })
      return
    }

    const order = db.updateOrderStatus(req.params.id, status, transactionId)
    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    res.json({ order })
  } catch (error) {
    console.error('Update order error:', error)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

export default router
