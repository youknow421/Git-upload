import { describe, it, expect } from 'vitest'
import {
  verifyWebhookSignature,
  mapWebhookStatusToOrderStatus,
  createMockWebhookPayload,
  handleWebhookAPI,
} from './orderApi'

describe('Webhook Signature Verification', () => {
  it('should reject payload without signature', () => {
    const payload = {
      orderId: 'ord_123',
      status: 'success' as const,
      paymentMethod: 'tranzilla',
      timestamp: new Date().toISOString(),
    }
    const result = verifyWebhookSignature(payload, 'test-secret')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Missing signature')
  })

  it('should accept mock signatures in development', () => {
    const payload = createMockWebhookPayload('ord_123', 'success')
    const result = verifyWebhookSignature(payload, 'test-secret')
    expect(result.valid).toBe(true)
  })
})

describe('Webhook Status Mapping', () => {
  it('should map success to completed', () => {
    expect(mapWebhookStatusToOrderStatus('success')).toBe('completed')
  })

  it('should map failed to failed', () => {
    expect(mapWebhookStatusToOrderStatus('failed')).toBe('failed')
  })

  it('should map cancelled to cancelled', () => {
    expect(mapWebhookStatusToOrderStatus('cancelled')).toBe('cancelled')
  })
})

describe('Mock Webhook Payload', () => {
  it('should create valid payload with signature', () => {
    const payload = createMockWebhookPayload('ord_test_123', 'success')
    expect(payload.orderId).toBe('ord_test_123')
    expect(payload.status).toBe('success')
    expect(payload.signature).toContain('mock_')
    expect(payload.transactionId).toBeDefined()
    expect(payload.timestamp).toBeDefined()
  })
})

describe('handleWebhookAPI', () => {
  it('should process valid webhook successfully', async () => {
    const payload = createMockWebhookPayload('ord_123', 'success')
    const result = await handleWebhookAPI(payload)
    expect(result.success).toBe(true)
    expect(result.orderStatus).toBe('completed')
  })

  it('should reject webhook without signature', async () => {
    const payload = {
      orderId: 'ord_123',
      status: 'success' as const,
      paymentMethod: 'tranzilla',
      timestamp: new Date().toISOString(),
    }
    const result = await handleWebhookAPI(payload)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Missing signature')
  })

  it('should handle cancelled webhooks', async () => {
    const payload = createMockWebhookPayload('ord_123', 'cancelled')
    const result = await handleWebhookAPI(payload)
    expect(result.success).toBe(true)
    expect(result.orderStatus).toBe('cancelled')
  })
})
