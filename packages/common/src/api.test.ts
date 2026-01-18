import { describe, it, expect } from 'vitest'
import { fetchProducts, fetchProductById, fetchProductBySlug, searchProducts } from './api'

describe('api', () => {
  it('fetchProducts returns a list', async () => {
    const list = await fetchProducts()
    expect(list.length).toBeGreaterThan(0)
  })

  it('fetchProductById finds by id', async () => {
    const item = await fetchProductById('1')
    expect(item).toBeTruthy()
    expect(item?.id).toBe('1')
  })

  it('searchProducts finds by term', async () => {
    const matches = await searchProducts('travel')
    expect(matches.length).toBeGreaterThan(0)
  })
})