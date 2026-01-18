import { describe, it, expect } from 'vitest'
import { products } from './products'

describe('products', () => {
  it('has sample products', () => {
    expect(products.length).toBeGreaterThan(0)
  })
})