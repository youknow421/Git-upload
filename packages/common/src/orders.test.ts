import { describe, it, expect } from 'vitest'
import { orderReducer, initialOrderState, OrderAction } from './orders'

describe('orderReducer', () => {
  it('should create a new order', () => {
    const action: OrderAction = {
      type: 'CREATE_ORDER',
      payload: {
        orderNumber: 'ORD-001',
        status: 'pending',
        items: [
          { productId: '1', productName: 'Laptop', price: 1000, qty: 1 },
        ],
        subtotal: 1000,
        tax: 80,
        total: 1080,
        customerName: 'Alice',
        customerEmail: 'alice@example.com',
        paymentMethod: 'tranzilla',
      },
    }
    const result = orderReducer(initialOrderState, action)

    expect(result.orders).toHaveLength(1)
    expect(result.orders[0].orderNumber).toBe('ORD-001')
    expect(result.orders[0].total).toBe(1080)
    expect(result.currentOrderId).toBe(result.orders[0].id)
  })

  it('should update order status', () => {
    const state = {
      orders: [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: 'pending' as const,
          items: [],
          subtotal: 100,
          tax: 8,
          total: 108,
          customerName: 'Bob',
          customerEmail: 'bob@example.com',
          paymentMethod: 'tranzilla' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      currentOrderId: null,
    }
    const action: OrderAction = {
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId: 'order-1', status: 'completed', completedAt: new Date().toISOString() },
    }
    const result = orderReducer(state, action)

    expect(result.orders[0].status).toBe('completed')
    expect(result.orders[0].completedAt).toBeDefined()
  })

  it('should add payment session to order', () => {
    const state = {
      orders: [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          status: 'pending' as const,
          items: [],
          subtotal: 100,
          tax: 8,
          total: 108,
          customerName: 'Charlie',
          customerEmail: 'charlie@example.com',
          paymentMethod: 'tranzilla' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      currentOrderId: null,
    }
    const action: OrderAction = {
      type: 'ADD_PAYMENT_SESSION',
      payload: { orderId: 'order-1', sessionId: 'session-123' },
    }
    const result = orderReducer(state, action)

    expect(result.orders[0].paymentSessionId).toBe('session-123')
  })
})
