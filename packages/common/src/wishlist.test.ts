import { describe, it, expect } from 'vitest'
import { wishlistReducer, initialWishlistState, WishlistState, WishlistAction } from './wishlist'

describe('wishlistReducer', () => {
  it('should add to wishlist', () => {
    const state = initialWishlistState
    const action: WishlistAction = { type: 'ADD_TO_WISHLIST', payload: 'product-1' }
    const result = wishlistReducer(state, action)

    expect(result.items).toEqual(['product-1'])
  })

  it('should not add duplicate to wishlist', () => {
    const state: WishlistState = { items: ['product-1'] }
    const action: WishlistAction = { type: 'ADD_TO_WISHLIST', payload: 'product-1' }
    const result = wishlistReducer(state, action)

    expect(result.items).toEqual(['product-1'])
  })

  it('should remove from wishlist', () => {
    const state: WishlistState = { items: ['product-1', 'product-2', 'product-3'] }
    const action: WishlistAction = { type: 'REMOVE_FROM_WISHLIST', payload: 'product-2' }
    const result = wishlistReducer(state, action)

    expect(result.items).toEqual(['product-1', 'product-3'])
  })

  it('should clear wishlist', () => {
    const state: WishlistState = { items: ['product-1', 'product-2'] }
    const action: WishlistAction = { type: 'CLEAR_WISHLIST' }
    const result = wishlistReducer(state, action)

    expect(result.items).toEqual([])
  })

  it('should set wishlist', () => {
    const state = initialWishlistState
    const action: WishlistAction = { type: 'SET_WISHLIST', payload: ['product-1', 'product-2'] }
    const result = wishlistReducer(state, action)

    expect(result.items).toEqual(['product-1', 'product-2'])
  })

  it('should return state for unknown action', () => {
    const state: WishlistState = { items: ['product-1'] }
    const action = { type: 'UNKNOWN' } as any
    const result = wishlistReducer(state, action)

    expect(result).toEqual(state)
  })
})
