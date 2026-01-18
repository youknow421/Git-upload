// In-memory database for orders (replace with real DB in production)
import { v4 as uuidv4 } from 'uuid'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'failed' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number // cents
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  total: number // cents
  status: OrderStatus
  customerName: string
  customerEmail: string
  paymentSessionId?: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

// In-memory store (replace with PostgreSQL/MongoDB in production)
const orders = new Map<string, Order>()

export function generateOrderId(): string {
  return `ord_${Date.now()}_${uuidv4().slice(0, 8)}`
}

export function generateOrderNumber(): string {
  return `ORD-${String(Date.now()).slice(-6)}`
}

export function createOrder(data: {
  items: OrderItem[]
  total: number
  customerName: string
  customerEmail: string
}): Order {
  const order: Order = {
    id: generateOrderId(),
    orderNumber: generateOrderNumber(),
    items: data.items,
    total: data.total,
    status: 'pending',
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  orders.set(order.id, order)
  return order
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id)
}

export function listOrders(customerEmail?: string): Order[] {
  const allOrders = Array.from(orders.values())
  if (customerEmail) {
    return allOrders.filter(o => o.customerEmail === customerEmail)
  }
  return allOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function updateOrderStatus(id: string, status: OrderStatus, transactionId?: string): Order | undefined {
  const order = orders.get(id)
  if (!order) return undefined
  
  order.status = status
  order.updatedAt = new Date()
  if (transactionId) {
    order.transactionId = transactionId
  }
  orders.set(id, order)
  return order
}

export function setPaymentSession(id: string, sessionId: string): Order | undefined {
  const order = orders.get(id)
  if (!order) return undefined
  
  order.paymentSessionId = sessionId
  order.status = 'processing'
  order.updatedAt = new Date()
  orders.set(id, order)
  return order
}
