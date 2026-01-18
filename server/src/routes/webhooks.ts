import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import * as db from '../db.js'
import { sendOrderConfirmationEmail, sendPaymentFailedEmail, sendRefundConfirmationEmail } from '../email.js'
import * as notifications from '../notifications.js'
import { getUserByEmail } from '../users.js'

const router = Router()

//TRANZILLA RESPONSE CODES

const TRANZILLA_CODES: Record<string, { status: 'success' | 'error'; message: string; messageHe?: string }> = {
  '000': { status: 'success', message: 'Transaction approved', messageHe: 'העסקה אושרה' },
  '001': { status: 'error', message: 'Blocked card', messageHe: 'כרטיס חסום' },
  '002': { status: 'error', message: 'Stolen card', messageHe: 'כרטיס גנוב' },
  '003': { status: 'error', message: 'Contact credit card company', messageHe: 'יש להתקשר לחברת האשראי' },
  '004': { status: 'error', message: 'Transaction refused', messageHe: 'העסקה סורבה' },
  '005': { status: 'error', message: 'Forged card', messageHe: 'כרטיס מזויף' },
  '006': { status: 'error', message: 'CVV or ID verification failed', messageHe: 'אימות CVV או ת.ז. נכשל' },
  '010': { status: 'error', message: 'Partial amount approved', messageHe: 'אושר סכום חלקי' },
  '014': { status: 'error', message: 'Invalid card number', messageHe: 'מספר כרטיס לא תקין' },
  '033': { status: 'error', message: 'Card expired', messageHe: 'פג תוקף הכרטיס' },
  '036': { status: 'error', message: 'Transaction cancelled', messageHe: 'העסקה בוטלה' },
  '039': { status: 'error', message: 'Invalid card number', messageHe: 'מספר כרטיס לא תקין' },
  '057': { status: 'error', message: 'Service not available', messageHe: 'השירות לא זמין' },
  '058': { status: 'error', message: 'Technical problem', messageHe: 'בעיה טכנית' },
  '059': { status: 'error', message: 'Communication error', messageHe: 'שגיאת תקשורת' },
  '060': { status: 'error', message: '3D Secure authentication required', messageHe: 'נדרש אימות תלת-ממדי' },
  '061': { status: 'error', message: 'Credit limit exceeded', messageHe: 'חריגה ממסגרת אשראי' },
  '062': { status: 'error', message: 'Transaction limit exceeded', messageHe: 'חריגה ממגבלת עסקה' },
  '063': { status: 'error', message: 'Number of transactions exceeded', messageHe: 'חריגה ממספר עסקאות' },
  '064': { status: 'error', message: 'Amount exceeds credit limit', messageHe: 'הסכום חורג ממסגרת האשראי' },
}

function getTranzillaMessage(code: string): { status: 'success' | 'error'; message: string } {
  return TRANZILLA_CODES[code] || { status: 'error', message: `Unknown error (code: ${code})` }
}

//WEBHOOK LOGGING

interface WebhookLog {
  id: string
  source: 'tranzilla' | 'mock'
  event: string
  orderId?: string
  payload: Record<string, any>
  status: 'success' | 'error'
  message: string
  timestamp: Date
  processedAt?: Date
}

const webhookLogs: WebhookLog[] = []
const processedWebhooks = new Set<string>()

function logWebhook(log: Omit<WebhookLog, 'id' | 'timestamp'>): WebhookLog {
  const entry: WebhookLog = {
    ...log,
    id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date(),
  }
  webhookLogs.unshift(entry)
  
  // Keep only last 1000 logs
  if (webhookLogs.length > 1000) webhookLogs.pop()
  
  console.log(`[Webhook ${entry.source}] ${entry.event}: ${entry.message}`, {
    orderId: entry.orderId,
    status: entry.status,
  })
  
  return entry
}

export function getWebhookLogs(limit = 50): WebhookLog[] {
  return webhookLogs.slice(0, limit)
}

// Generate idempotency key for a webhook
function getIdempotencyKey(source: string, orderId: string, index?: string): string {
  return `${source}:${orderId}:${index || 'noindex'}`
}

//TRANZILLA PAYMENT WEBHOOK

router.post('/tranzilla', async (req: Request, res: Response) => {
  try {
    console.log('═══════════════════════════════════════════════')
    console.log('📥 Tranzilla Webhook Received')
    console.log('═══════════════════════════════════════════════')
    console.log('Body:', JSON.stringify(req.body, null, 2))
    console.log('───────────────────────────────────────────────')
    
    const { 
      order_id,
      Response: tranzillaResponse,
      ConfirmationCode,
      index,
      sum,
      ccno,
      expdate,
      tranmode,
      CCode,
      cred_type,
      npay,
      fpay,
    } = req.body

    // Validate required fields
    if (!order_id) {
      logWebhook({
        source: 'tranzilla',
        event: 'validation_error',
        payload: req.body,
        status: 'error',
        message: 'Missing order_id',
      })
      res.status(400).json({ error: 'Missing order_id' })
      return
    }

    // Idempotency check
    const idempotencyKey = getIdempotencyKey('tranzilla', order_id, index)
    if (processedWebhooks.has(idempotencyKey)) {
      console.log(`⚠️ Duplicate webhook ignored: ${idempotencyKey}`)
      res.json({ success: true, duplicate: true })
      return
    }

    // Find the order
    const order = db.getOrder(order_id)
    if (!order) {
      logWebhook({
        source: 'tranzilla',
        event: 'order_not_found',
        orderId: order_id,
        payload: req.body,
        status: 'error',
        message: `Order not found: ${order_id}`,
      })
      res.status(404).json({ error: 'Order not found' })
      return
    }

    // Skip if order already processed
    if (['processing', 'shipped', 'delivered', 'completed'].includes(order.status)) {
      console.log(`⚠️ Order ${order.orderNumber} already processed (${order.status})`)
      processedWebhooks.add(idempotencyKey)
      res.json({ success: true, alreadyProcessed: true, status: order.status })
      return
    }

    // Parse Tranzilla response code
    const { status: txStatus, message: txMessage } = getTranzillaMessage(tranzillaResponse || '999')
    const isSuccess = txStatus === 'success'
    
    // Determine new order status
    let newStatus: db.OrderStatus
    if (isSuccess) {
      newStatus = 'processing' // Payment received, order processing
    } else if (tranzillaResponse === '036') {
      newStatus = 'cancelled' // User cancelled
    } else {
      newStatus = 'failed' // Payment failed
    }

    // Build payment details for logging
    const paymentDetails = {
      responseCode: tranzillaResponse,
      confirmationCode: ConfirmationCode,
      index,
      maskedCard: ccno ? `****${ccno.slice(-4)}` : undefined,
      transactionMode: tranmode,
      creditType: cred_type,
      numPayments: npay,
      firstPayment: fpay,
      message: txMessage,
    }

    // Update order
    const transactionId = isSuccess ? (ConfirmationCode || index) : undefined
    db.updateOrderStatus(order_id, newStatus, transactionId)
    
    // Mark as processed
    processedWebhooks.add(idempotencyKey)
    
    // Log the webhook
    logWebhook({
      source: 'tranzilla',
      event: isSuccess ? 'payment_success' : 'payment_failed',
      orderId: order_id,
      payload: { ...paymentDetails },
      status: isSuccess ? 'success' : 'error',
      message: `${txMessage} - Order ${order.orderNumber} -> ${newStatus}`,
    })

    // Send notifications
    const user = getUserByEmail(order.customerEmail)
    
    if (isSuccess) {
      console.log(`✅ Payment successful for order ${order.orderNumber}`)
      
      // Send confirmation email
      await sendOrderConfirmationEmail(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        order.items,
        order.total / 100
      )
      
      // In-app notification
      if (user) {
        notifications.createNotification(
          user.id,
          'order_confirmed',
          'Payment Received! 🎉',
          `Your payment for order #${order.orderNumber} was successful. We're processing your order now.`,
          { orderId: order.id, orderNumber: order.orderNumber }
        )
      }
    } else {
      console.log(`❌ Payment failed for order ${order.orderNumber}: ${txMessage}`)
      
      // Send failure email
      await sendPaymentFailedEmail(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        txMessage
      )
      
      // In-app notification
      if (user) {
        notifications.createNotification(
          user.id,
          'payment_failed',
          'Payment Failed',
          `Your payment for order #${order.orderNumber} was not successful: ${txMessage}`,
          { orderId: order.id, orderNumber: order.orderNumber, reason: txMessage }
        )
      }
    }

    // Always return 200 to acknowledge receipt
    res.json({ 
      success: true, 
      processed: true,
      orderId: order_id,
      status: newStatus,
    })
    
  } catch (error) {
    console.error('❌ Tranzilla webhook error:', error)
    
    logWebhook({
      source: 'tranzilla',
      event: 'processing_error',
      payload: req.body,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    
    // Return 200 to prevent retries for internal errors
    res.json({ success: false, error: 'Internal processing error' })
  }
})

//TRANZILLA REFUND WEBHOOK

router.post('/tranzilla/refund', async (req: Request, res: Response) => {
  try {
    console.log('📥 Tranzilla Refund Webhook:', req.body)
    
    const { 
      order_id,
      Response: tranzillaResponse,
      ConfirmationCode,
      refund_index,
      sum,
    } = req.body

    if (!order_id) {
      res.status(400).json({ error: 'Missing order_id' })
      return
    }

    const order = db.getOrder(order_id)
    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    const isSuccess = tranzillaResponse === '000'
    const refundAmount = sum ? (Number(sum) / 100).toFixed(2) : 'N/A'
    
    if (isSuccess) {
      db.updateOrderStatus(order_id, 'cancelled')
      
      logWebhook({
        source: 'tranzilla',
        event: 'refund_success',
        orderId: order_id,
        payload: req.body,
        status: 'success',
        message: `Refund of ₪${refundAmount} processed for order ${order.orderNumber}`,
      })
      
      // Send refund confirmation email
      await sendRefundConfirmationEmail(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        Number(refundAmount)
      )
      
      // Notify customer
      const user = getUserByEmail(order.customerEmail)
      if (user) {
        notifications.createNotification(
          user.id,
          'order_cancelled',
          'Refund Processed',
          `Your refund of ₪${refundAmount} for order #${order.orderNumber} has been processed.`,
          { orderId: order.id, orderNumber: order.orderNumber, amount: refundAmount }
        )
      }
    } else {
      const { message } = getTranzillaMessage(tranzillaResponse)
      logWebhook({
        source: 'tranzilla',
        event: 'refund_failed',
        orderId: order_id,
        payload: req.body,
        status: 'error',
        message: `Refund failed for order ${order.orderNumber}: ${message}`,
      })
    }

    res.json({ success: isSuccess })
  } catch (error) {
    console.error('Tranzilla refund webhook error:', error)
    res.json({ success: false })
  }
})

//MOCK PAYMENT WEBHOOK (Development)

router.post('/mock', async (req: Request, res: Response) => {
  try {
    const { orderId, status, delay } = req.body
    
    console.log('📥 Mock Payment Webhook:', { orderId, status })
    
    if (!orderId || !status) {
      res.status(400).json({ error: 'Missing orderId or status' })
      return
    }

    const validStatuses = ['success', 'failed', 'cancelled']
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status. Use: success, failed, cancelled' })
      return
    }

    // Optional delay to simulate real webhook timing
    if (delay && Number(delay) > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(Number(delay), 5000)))
    }

    const statusMap: Record<string, db.OrderStatus> = {
      success: 'processing',
      failed: 'failed',
      cancelled: 'cancelled',
    }

    const order = db.getOrder(orderId)
    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    db.updateOrderStatus(orderId, statusMap[status], status === 'success' ? `MOCK_${Date.now()}` : undefined)

    logWebhook({
      source: 'mock',
      event: `payment_${status}`,
      orderId,
      payload: req.body,
      status: status === 'success' ? 'success' : 'error',
      message: `Mock webhook: Order ${order.orderNumber} -> ${statusMap[status]}`,
    })

    // Send notifications for mock webhooks too
    const user = getUserByEmail(order.customerEmail)
    
    if (status === 'success') {
      await sendOrderConfirmationEmail(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        order.items,
        order.total / 100
      )
      
      if (user) {
        notifications.createNotification(
          user.id,
          'order_confirmed',
          'Payment Received! 🎉',
          `Your payment for order #${order.orderNumber} was successful.`,
          { orderId: order.id, orderNumber: order.orderNumber }
        )
      }
    } else if (status === 'failed') {
      await sendPaymentFailedEmail(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        'Payment was declined'
      )
      
      if (user) {
        notifications.createNotification(
          user.id,
          'payment_failed',
          'Payment Failed',
          `Your payment for order #${order.orderNumber} was not successful.`,
          { orderId: order.id, orderNumber: order.orderNumber }
        )
      }
    }

    res.json({ 
      success: true, 
      order: db.getOrder(orderId),
      message: `Order ${order.orderNumber} updated to ${statusMap[status]}`,
    })
  } catch (error) {
    console.error('Mock webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// WEBHOOK TEST ENDPOINT

router.post('/test/tranzilla', async (req: Request, res: Response) => {
  try {
    const { orderId, success, responseCode } = req.body
    
    if (!orderId) {
      res.status(400).json({ error: 'orderId required' })
      return
    }

    // Simulate webhook payload
    const mockPayload = {
      order_id: orderId,
      Response: success !== false ? '000' : (responseCode || '004'),
      ConfirmationCode: success !== false ? `TEST_${Date.now()}` : undefined,
      index: `idx_${Date.now()}`,
      sum: '10000',
      ccno: '1234567890001234',
      expdate: '1225',
      tranmode: 'A',
    }

    console.log('🧪 Simulating Tranzilla webhook:', mockPayload)
    
    // Make internal request to actual webhook endpoint
    const port = process.env.PORT || 3001
    const response = await fetch(`http://localhost:${port}/api/webhooks/tranzilla`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPayload),
    })
    
    const result = await response.json()
    
    res.json({
      message: 'Test webhook sent',
      webhookPayload: mockPayload,
      webhookResponse: result,
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    res.status(500).json({ error: 'Test failed' })
  }
})

//WEBHOOK LOGS ENDPOINT

router.get('/logs', (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200)
  const logs = getWebhookLogs(limit)
  res.json({ logs, total: webhookLogs.length })
})

//SIGNATURE VERIFICATION

export function verifyWebhookSignature(secret: string) {
  return (req: Request, res: Response, next: Function) => {
    const signature = req.headers['x-webhook-signature'] as string
    
    if (!signature) {
      // Allow unsigned requests in development
      if (process.env.NODE_ENV === 'development') {
        return next()
      }
      res.status(401).json({ error: 'Missing signature' })
      return
    }

    const payload = JSON.stringify(req.body)
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      res.status(401).json({ error: 'Invalid signature' })
      return
    }

    next()
  }
}

export default router
