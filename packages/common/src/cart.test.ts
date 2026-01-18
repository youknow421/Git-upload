import { describe, it, expect } from 'vitest'
import { cartReducer, initialCart } from './cart'
import { products } from './products'

describe('cartReducer', () => {
  it('adds an item', () => {
    const state = initialCart
    const action = { type: 'ADD', product: products[0], qty: 2 }
    const next = cartReducer(state, action as any)
    expect(next.items.length).toBe(1)
    expect(next.items[0].qty).toBe(2)
  })

  it('removes an item', () => {
    const state = { items: [{ product: products[0], qty: 1 }] }
    const next = cartReducer(state as any, { type: 'REMOVE', productId: products[0].id } as any)
    expect(next.items.length).toBe(0)
  })
})