import type { Order, OrderItem } from './orders'
import type { PaymentSession } from './payments'

export type CreateOrderRequest = {
  items: OrderItem[]
  customerName: string
  customerEmail: string
  paymentMethod: 'tranzilla' | 'mock'
}

export type CreateOrderResponse = {
  orderId: string
  orderNumber: string
  paymentSession?: PaymentSession
}

export type WebhookPayload = {
  orderId: string
  status: 'success' | 'failed' | 'cancelled'
  transactionId?: string
  paymentMethod: string
  timestamp: string
  signature?: string
}

export type WebhookVerificationResult = {
  valid: boolean
  error?: string
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: WebhookPayload,
  secret: string
): WebhookVerificationResult {

  if (!payload.signature) {
    return { valid: false, error: 'Missing signature' }
  }
  if (payload.signature.startsWith('mock_')) {
    return { valid: true }
  }
  // In production, verify the actual signature
  return { valid: true }
}

export function mapWebhookStatusToOrderStatus(
  webhookStatus: 'success' | 'failed' | 'cancelled'
): 'completed' | 'failed' | 'cancelled' {
  const statusMap = {
    success: 'completed' as const,
    failed: 'failed' as const,
    cancelled: 'cancelled' as const,
  }
  return statusMap[webhookStatus]
}

// Mock APi client
export async function createOrderAPI(req: CreateOrderRequest): Promise<CreateOrderResponse> {
  // In production(wink wink), this would POST to /api/orders
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const orderNumber = `ORD-${String(Date.now()).slice(-6)}`
  
  return {
    orderId,
    orderNumber,
    // Payment session would be returned by backend
  }
}

export async function getOrderAPI(orderId: string): Promise<Order | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return null
}

export async function listOrdersAPI(): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return []
}

export async function handleWebhookAPI(
  payload: WebhookPayload,
  secret: string = 'dev-webhook-secret'
): Promise<{ success: boolean; orderStatus?: string; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  //Verify signature
  const verification = verifyWebhookSignature(payload, secret)
  if (!verification.valid) {
    return { success: false, error: verification.error || 'Invalid signature' }
  }

  // Map to order status
  const orderStatus = mapWebhookStatusToOrderStatus(payload.status)
  
  // In production: update database, send email, etc.
  console.log(`Webhook processed: Order ${payload.orderId} -> ${orderStatus}`)
  
  return { success: true, orderStatus }
}

// Simulate receiving a webhook (for testing)
export function createMockWebhookPayload(
  orderId: string,
  status: 'success' | 'failed' | 'cancelled'
): WebhookPayload {
  return {
    orderId,
    status,
    transactionId: `txn_${Date.now()}`,
    paymentMethod: 'mock',
    timestamp: new Date().toISOString(),
    signature: `mock_${orderId}_${status}`,
  }
}
