import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { cartReducer, initialCart } from './cart'
import type { CartState, CartAction } from './cart'
import { wishlistReducer, initialWishlistState } from './wishlist'
import type { WishlistState, WishlistAction } from './wishlist'
import { groupReducer, initialGroupState } from './groups'
import type { GroupState, GroupAction } from './groups'
import { orderReducer, initialOrderState } from './orders'
import type { OrderState, OrderAction, Order, OrderItem } from './orders'

// Storage that works in both browser and simple sync adapters
type StorageLike = {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem?(key: string): void | Promise<void>
}

export type CartContextValue = {
  state: CartState
  add: (product: any, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  itemsArray: CartState['items']
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children, storage }: { children: React.ReactNode; storage?: StorageLike }) {
  const storageBackend = storage ?? (typeof window !== 'undefined' ? window.localStorage : null)

  function load(): CartState {
    try {
      if (!storageBackend) return initialCart
      const raw = (storageBackend.getItem as any)('cart')
      const rawSync = typeof raw === 'string' ? raw : null
      if (!rawSync) return initialCart
      const parsed = JSON.parse(rawSync)
      if (parsed.items && Array.isArray(parsed.items)) return parsed
      if (parsed.items && !Array.isArray(parsed.items)) return { items: Object.values(parsed.items) }
      return parsed
    } catch (e) {
      return initialCart
    }
  }

  function save(state: CartState) {
    try {
      if (!storageBackend) return
      const setResult = storageBackend.setItem('cart', JSON.stringify(state) as any)
      // ignore Promise result
      void setResult
    } catch (e) {
      // ignore
    }
  }

  const [state, dispatch] = useReducer<React.Reducer<CartState, CartAction>>(cartReducer as any, undefined as any, load as any)

  useEffect(() => {
    save(state)
  }, [state])

  const add = (product: any, qty = 1) => dispatch({ type: 'ADD', product, qty } as CartAction)
  const remove = (id: string) => dispatch({ type: 'REMOVE', productId: id } as CartAction)
  const setQty = (id: string, qty: number) => dispatch({ type: 'SET_QTY', productId: id, qty } as CartAction)
  const clear = () => dispatch({ type: 'CLEAR' } as CartAction)

  const itemsArray = state.items || []
  const totalItems = itemsArray.reduce((s: number, it: any) => s + it.qty, 0)
  const totalPrice = itemsArray.reduce((s: number, it: any) => s + it.qty * it.product.price, 0)

  return (
    <CartContext.Provider value={{ state, add, remove, setQty, clear, itemsArray, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

// Wishlist Context
export type WishlistContextValue = {
  state: WishlistState
  addToWishlist: (slug: string) => void
  removeFromWishlist: (slug: string) => void
  toggleWishlist: (slug: string) => void
  clearWishlist: () => void
  isInWishlist: (slug: string) => boolean
  items: string[]
  itemCount: number
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export function WishlistProvider({ children, storage }: { children: React.ReactNode; storage?: StorageLike }) {
  const storageBackend = storage ?? (typeof window !== 'undefined' ? window.localStorage : null)

  function load(): WishlistState {
    try {
      if (!storageBackend) return initialWishlistState
      const raw = (storageBackend.getItem as any)('wishlist')
      const rawSync = typeof raw === 'string' ? raw : null
      if (!rawSync) return initialWishlistState
      const parsed = JSON.parse(rawSync)
      if (parsed.items && Array.isArray(parsed.items)) return parsed
      return initialWishlistState
    } catch (e) {
      return initialWishlistState
    }
  }

  function save(state: WishlistState) {
    try {
      if (!storageBackend) return
      const setResult = storageBackend.setItem('wishlist', JSON.stringify(state) as any)
      void setResult
    } catch (e) {
      // ignore
    }
  }

  const [state, dispatch] = useReducer<React.Reducer<WishlistState, WishlistAction>>(wishlistReducer as any, undefined as any, load as any)

  useEffect(() => {
    save(state)
  }, [state])

  const addToWishlist = (slug: string) => dispatch({ type: 'ADD_TO_WISHLIST', payload: slug } as WishlistAction)
  const removeFromWishlist = (slug: string) => dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: slug } as WishlistAction)
  const toggleWishlist = (slug: string) => {
    if (state.items.includes(slug)) {
      removeFromWishlist(slug)
    } else {
      addToWishlist(slug)
    }
  }
  const clearWishlist = () => dispatch({ type: 'CLEAR_WISHLIST' } as WishlistAction)
  const isInWishlist = (slug: string) => state.items.includes(slug)

  return (
    <WishlistContext.Provider
      value={{
        state,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        items: state.items,
        itemCount: state.items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}

// Groups Context
export type GroupContextValue = {
  state: GroupState
  createGroup: (name: string, description: string) => void
  deleteGroup: (groupId: string) => void
  setActiveGroup: (groupId: string | null) => void
  addMember: (groupId: string, member: { id: string; name: string; email: string; role: 'admin' | 'member' }) => void
  removeMember: (groupId: string, memberId: string) => void
  updateMemberRole: (groupId: string, memberId: string, role: 'owner' | 'admin' | 'member') => void
  updateGroup: (groupId: string, updates: { name?: string; description?: string }) => void
  addToSharedCart: (groupId: string, itemId: string) => void
  removeFromSharedCart: (groupId: string, itemId: string) => void
  groups: GroupState['groups']
  activeGroup: GroupState['groups'][0] | null
}

const GroupContext = createContext<GroupContextValue | undefined>(undefined)

export function GroupProvider({ children, storage }: { children: React.ReactNode; storage?: StorageLike }) {
  const storageBackend = storage ?? (typeof window !== 'undefined' ? window.localStorage : null)

  function load(): GroupState {
    try {
      if (!storageBackend) return initialGroupState
      const raw = (storageBackend.getItem as any)('groups')
      const rawSync = typeof raw === 'string' ? raw : null
      if (!rawSync) return initialGroupState
      const parsed = JSON.parse(rawSync)
      if (parsed.groups && Array.isArray(parsed.groups)) return parsed
      return initialGroupState
    } catch (e) {
      return initialGroupState
    }
  }

  function save(state: GroupState) {
    try {
      if (!storageBackend) return
      const setResult = storageBackend.setItem('groups', JSON.stringify(state) as any)
      void setResult
    } catch (e) {
      // ignore
    }
  }

  const [state, dispatch] = useReducer<React.Reducer<GroupState, GroupAction>>(groupReducer as any, undefined as any, load as any)

  useEffect(() => {
    save(state)
  }, [state])

  const createGroup = (name: string, description: string) =>
    dispatch({ type: 'CREATE_GROUP', payload: { name, description } } as GroupAction)
  
  const deleteGroup = (groupId: string) =>
    dispatch({ type: 'DELETE_GROUP', payload: groupId } as GroupAction)
  
  const setActiveGroup = (groupId: string | null) =>
    dispatch({ type: 'SET_ACTIVE_GROUP', payload: groupId } as GroupAction)
  
  const addMember = (groupId: string, member: { id: string; name: string; email: string; role: 'admin' | 'member' }) =>
    dispatch({ type: 'ADD_MEMBER', payload: { groupId, member } } as GroupAction)
  
  const removeMember = (groupId: string, memberId: string) =>
    dispatch({ type: 'REMOVE_MEMBER', payload: { groupId, memberId } } as GroupAction)
  
  const updateMemberRole = (groupId: string, memberId: string, role: 'owner' | 'admin' | 'member') =>
    dispatch({ type: 'UPDATE_MEMBER_ROLE', payload: { groupId, memberId, role } } as GroupAction)
  
  const updateGroup = (groupId: string, updates: { name?: string; description?: string }) =>
    dispatch({ type: 'UPDATE_GROUP', payload: { groupId, ...updates } } as GroupAction)
  
  const addToSharedCart = (groupId: string, itemId: string) =>
    dispatch({ type: 'ADD_TO_SHARED_CART', payload: { groupId, itemId } } as GroupAction)
  
  const removeFromSharedCart = (groupId: string, itemId: string) =>
    dispatch({ type: 'REMOVE_FROM_SHARED_CART', payload: { groupId, itemId } } as GroupAction)

  const activeGroup = state.groups.find((g) => g.id === state.activeGroupId) || null

  return (
    <GroupContext.Provider
      value={{
        state,
        createGroup,
        deleteGroup,
        setActiveGroup,
        addMember,
        removeMember,
        updateMemberRole,
        updateGroup,
        addToSharedCart,
        removeFromSharedCart,
        groups: state.groups,
        activeGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  )
}

export function useGroups() {
  const ctx = useContext(GroupContext)
  if (!ctx) throw new Error('useGroups must be used within a GroupProvider')
  return ctx
}

// Orders Context
export type OrderContextValue = {
  state: OrderState
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateOrderStatus: (orderId: string, status: Order['status'], completedAt?: string) => void
  setCurrentOrder: (orderId: string | null) => void
  addPaymentSession: (orderId: string, sessionId: string) => void
  orders: OrderState['orders']
  currentOrder: Order | null
  getOrderById: (orderId: string) => Order | undefined
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined)

export function OrderProvider({ children, storage }: { children: React.ReactNode; storage?: StorageLike }) {
  const storageBackend = storage ?? (typeof window !== 'undefined' ? window.localStorage : null)

  function load(): OrderState {
    try {
      if (!storageBackend) return initialOrderState
      const raw = (storageBackend.getItem as any)('orders')
      const rawSync = typeof raw === 'string' ? raw : null
      if (!rawSync) return initialOrderState
      const parsed = JSON.parse(rawSync)
      if (parsed.orders && Array.isArray(parsed.orders)) return parsed
      return initialOrderState
    } catch (e) {
      return initialOrderState
    }
  }

  function save(state: OrderState) {
    try {
      if (!storageBackend) return
      const setResult = storageBackend.setItem('orders', JSON.stringify(state) as any)
      void setResult
    } catch (e) {
      // ignore
    }
  }

  const [state, dispatch] = useReducer<React.Reducer<OrderState, OrderAction>>(
    orderReducer as any,
    undefined as any,
    load as any
  )

  useEffect(() => {
    save(state)
  }, [state])

  const createOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): string => {
    dispatch({ type: 'CREATE_ORDER', payload: order } as OrderAction)
    return `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  const updateOrderStatus = (orderId: string, status: Order['status'], completedAt?: string) =>
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status, completedAt } } as OrderAction)

  const setCurrentOrder = (orderId: string | null) =>
    dispatch({ type: 'SET_CURRENT_ORDER', payload: orderId } as OrderAction)

  const addPaymentSession = (orderId: string, sessionId: string) =>
    dispatch({ type: 'ADD_PAYMENT_SESSION', payload: { orderId, sessionId } } as OrderAction)

  const getOrderById = (orderId: string) => state.orders.find((o) => o.id === orderId)

  const currentOrder = state.currentOrderId ? getOrderById(state.currentOrderId) || null : null

  return (
    <OrderContext.Provider
      value={{
        state,
        createOrder,
        updateOrderStatus,
        setCurrentOrder,
        addPaymentSession,
        orders: state.orders,
        currentOrder,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used within an OrderProvider')
  return ctx
}



