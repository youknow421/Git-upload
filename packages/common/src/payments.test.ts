import { describe, it, expect } from 'vitest'
import { createTranzillaSession, createMockSession } from './payments'

const req = {
  amount: 123.45,
  orderId: 'order-1',
  description: 'Test Order',
  customerName: 'Alice',
  customerEmail: 'alice@example.com',
  cancelUrl: 'https://example.com/cancel',
  successUrl: 'https://example.com/success',
}

const cfg = {
  supplier: 'demo-supplier',
  terminal: 'demo-terminal',
  password: 'demo-password',
  currency: '840',
  lang: 'en',
  sandbox: true,
}

describe('createTranzillaSession', () => {
  it('builds payload with required fields', () => {
    const session = createTranzillaSession(req, cfg)
    expect(session.postUrl).toContain('tranzila')
    expect(session.payload.supplier).toBe(cfg.supplier)
    expect(session.payload.sum).toBe('123.45')
    expect(session.payload.orderid).toBe(req.orderId)
    expect(session.payload.success_url).toBe(req.successUrl)
  })
})

describe('createMockSession', () => {
  it('returns a mock payload when no credentials', () => {
    const session = createMockSession(req)
    expect(session.sandbox).toBe(true)
    expect(session.payload.sum).toBe('123.45')
  })
})
