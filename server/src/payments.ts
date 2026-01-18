// Tranzilla payment integration
import crypto from 'crypto'

export interface TranzillaConfig {
  supplier: string
  terminal: string
  password: string
  sandbox: boolean
  currency: string
  lang: string
}

export interface PaymentRequest {
  orderId: string
  amount: number // in dollars
  description: string
  customerName: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
}

export interface PaymentSession {
  url: string
  payload: Record<string, string>
  sessionId: string
}

export function loadTranzillaConfig(): TranzillaConfig | null {
  const supplier = process.env.TRANZILLA_SUPPLIER
  const terminal = process.env.TRANZILLA_TERMINAL
  const password = process.env.TRANZILLA_PASSWORD
  
  if (!supplier || !terminal || !password || 
      supplier === 'your_supplier_id') {
    return null
  }

  return {
    supplier,
    terminal,
    password,
    sandbox: process.env.TRANZILLA_SANDBOX === 'true',
    currency: process.env.TRANZILLA_CURRENCY || '1', // 1 = ILS
    lang: process.env.TRANZILLA_LANG || 'il',
  }
}

export function createTranzillaSession(
  req: PaymentRequest,
  config: TranzillaConfig
): PaymentSession {
  const sessionId = `sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
  
  // Amount in agorot (cents) for Tranzilla
  const sumInAgorot = Math.round(req.amount * 100)
  
  const baseUrl = config.sandbox
    ? 'https://direct.tranzila.com'
    : 'https://direct.tranzila.com'

  const payload: Record<string, string> = {
    supplier: config.supplier,
    terminal: config.terminal,
    TranzilaPW: config.password,
    sum: String(sumInAgorot),
    currency: config.currency,
    lang: config.lang,
    pdesc: req.description,
    contact: req.customerName,
    email: req.customerEmail,
    order_id: req.orderId,
    success_url_address: req.successUrl,
    fail_url_address: req.cancelUrl,
    notify_url_address: `${process.env.FRONTEND_URL?.replace(':5173', ':3001')}/api/webhooks/tranzilla`,
  }

  return {
    url: `${baseUrl}/${config.supplier}/iframe.php`,
    payload,
    sessionId,
  }
}

export function createMockSession(req: PaymentRequest): PaymentSession {
  const sessionId = `mock_sess_${Date.now()}`
  
  return {
    url: 'mock://payment',
    payload: {
      orderId: req.orderId,
      amount: String(req.amount),
      mock: 'true',
    },
    sessionId,
  }
}

// Verify Tranzilla webhook signature
export function verifyTranzillaWebhook(
  payload: Record<string, string>,
  signature: string,
  secret: string
): boolean {
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  )
}
