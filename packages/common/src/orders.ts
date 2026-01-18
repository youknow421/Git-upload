export type OrderItem = {
  productId: string
  productName: string
  price: number
  qty: number
}

export type Order = {
  id: string
  orderNumber: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  customerName: string
  customerEmail: string
  paymentMethod: 'tranzilla' | 'mock'
  paymentSessionId?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type OrderState = {
  orders: Order[]
  currentOrderId: string | null
}

export type OrderAction =
  | { type: 'CREATE_ORDER'; payload: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status']; completedAt?: string } }
  | { type: 'SET_CURRENT_ORDER'; payload: string | null }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_PAYMENT_SESSION'; payload: { orderId: string; sessionId: string } }

export const initialOrderState: OrderState = {
  orders: [],
  currentOrderId: null,
}

function generateOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'CREATE_ORDER': {
      const newOrder: Order = {
        ...action.payload,
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return {
        ...state,
        orders: [newOrder, ...state.orders],
        currentOrderId: newOrder.id,
      }
    }
    case 'UPDATE_ORDER_STATUS': {
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id === action.payload.orderId) {
            return {
              ...order,
              status: action.payload.status,
              updatedAt: new Date().toISOString(),
              ...(action.payload.completedAt && { completedAt: action.payload.completedAt }),
            }
          }
          return order
        }),
      }
    }
    case 'SET_CURRENT_ORDER': {
      return {
        ...state,
        currentOrderId: action.payload,
      }
    }
    case 'SET_ORDERS': {
      return {
        ...state,
        orders: action.payload,
      }
    }
    case 'ADD_PAYMENT_SESSION': {
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id === action.payload.orderId) {
            return {
              ...order,
              paymentSessionId: action.payload.sessionId,
              updatedAt: new Date().toISOString(),
            }
          }
          return order
        }),
      }
    }
    default:
      return state
  }
}
