export type TranzillaConfig = {
  supplier: string
  terminal: string
  password: string
  currency?: string // default: 840 (USD)
  lang?: string // default: en
  sandbox?: boolean // default: true
}

export type PaymentRequest = {
  amount: number
  orderId: string
  description: string
  customerName: string
  customerEmail: string
  cancelUrl: string
  successUrl: string
  notifyUrl?: string
}

export type PaymentSession = {
  postUrl: string
  payload: Record<string, string>
  sandbox: boolean
}
export function createTranzillaSession(req: PaymentRequest, cfg: TranzillaConfig): PaymentSession {
  const currency = cfg.currency ?? '840'
  const lang = cfg.lang ?? 'en'
  const sandbox = cfg.sandbox ?? true

  const postUrl = sandbox
    ? 'https://direct.tranzila.com/cgi-bin/tranzila71u.cgi'
    : 'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi'

  const payload: Record<string, string> = {
    supplier: cfg.supplier,
    terminal_name: cfg.terminal,
    tranzila_pw: cfg.password,
    currency,
    lang,
    sum: req.amount.toFixed(2),
    orderid: req.orderId,
    tranmode: 'A', // auth/capture
    confirmation: '1',
    cred_type: '1', // credit card
    email: req.customerEmail,
    contact: req.customerName,
    description: req.description,
    success_url: req.successUrl,
    error_url: req.cancelUrl,
    notify_url: req.notifyUrl ?? req.successUrl,
  }

  return { postUrl, payload, sandbox }
}

export function hasTranzillaEnv(): boolean {
  return Boolean(
    process.env.TRANZILLA_SUPPLIER &&
      process.env.TRANZILLA_TERMINAL &&
      process.env.TRANZILLA_PASSWORD
  )
}

export function loadTranzillaConfig(): TranzillaConfig | null {
  if (!hasTranzillaEnv()) return null
  return {
    supplier: process.env.TRANZILLA_SUPPLIER as string,
    terminal: process.env.TRANZILLA_TERMINAL as string,
    password: process.env.TRANZILLA_PASSWORD as string,
    currency: process.env.TRANZILLA_CURRENCY ?? '840',
    lang: process.env.TRANZILLA_LANG ?? 'en',
    sandbox: process.env.TRANZILLA_SANDBOX ? process.env.TRANZILLA_SANDBOX === 'true' : true,
  }
}

export function createMockSession(req: PaymentRequest): PaymentSession {
  return {
    postUrl: 'https://example.com/mock-tranzilla',
    payload: {
      ...req,
      sum: req.amount.toFixed(2),
      note: 'Mock session — configure TRANZILLA_* env vars for real payments',
    } as any,
    sandbox: true,
  }
}

export function buildAutoSubmitFormHtml(session: PaymentSession): string {
  const inputs = Object.entries(session.payload)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${escapeHtml(String(v))}" />`)
    .join('')
  return `<!doctype html><html><body>
    <form id="tz" method="POST" action="${session.postUrl}">${inputs}</form>
    <script>document.getElementById('tz').submit();</script>
  </body></html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
