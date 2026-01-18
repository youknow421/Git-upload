import { describe, it, expect } from 'vitest'
import { fuzzyMatch, fuzzyScore, searchProducts, highlightMatch } from './search'
import type { Product } from './types'

describe('fuzzyMatch', () => {
  it('should match exact substring', () => {
    expect(fuzzyMatch('hello world', 'world')).toBe(true)
    expect(fuzzyMatch('hello world', 'hello')).toBe(true)
  })

  it('should match fuzzy characters', () => {
    expect(fuzzyMatch('hello world', 'hwo')).toBe(true)
    expect(fuzzyMatch('javascript', 'jvspt')).toBe(true)
  })

  it('should not match unrelated text', () => {
    expect(fuzzyMatch('hello', 'xyz')).toBe(false)
  })

  it('should match empty query', () => {
    expect(fuzzyMatch('anything', '')).toBe(true)
  })
})

describe('fuzzyScore', () => {
  it('should score exact match highest', () => {
    expect(fuzzyScore('test', 'test')).toBe(1000)
  })

  it('should score starts-with high', () => {
    const score = fuzzyScore('testing', 'test')
    expect(score).toBeGreaterThan(600)
    expect(score).toBeLessThan(1000)
  })

  it('should score contains match medium', () => {
    const score = fuzzyScore('my test string', 'test')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(800)
  })
})

describe('searchProducts', () => {
  const mockProducts: Product[] = [
    { id: '1', name: 'Laptop', description: 'Powerful laptop', price: 1000, slug: 'laptop', image: '', category: 'electronics' },
    { id: '2', name: 'Mouse', description: 'Wireless mouse', price: 50, slug: 'mouse', image: '', category: 'electronics' },
    { id: '3', name: 'Keyboard', description: 'Mechanical keyboard', price: 100, slug: 'keyboard', image: '', category: 'electronics' },
  ]

  it('should return all products for empty query', () => {
    expect(searchProducts(mockProducts, '')).toEqual(mockProducts)
  })

  it('should filter and rank products', () => {
    const results = searchProducts(mockProducts, 'lap')
    expect(results[0].name).toBe('Laptop')
  })

  it('should search in description', () => {
    const results = searchProducts(mockProducts, 'wireless')
    expect(results[0].name).toBe('Mouse')
  })
})

describe('highlightMatch', () => {
  it('should highlight exact match', () => {
    const result = highlightMatch('hello world', 'world')
    expect(result).toEqual([
      { text: 'hello ', highlight: false },
      { text: 'world', highlight: true },
    ])
  })

  it('should return unhighlighted for no match', () => {
    const result = highlightMatch('hello', 'xyz')
    expect(result).toEqual([{ text: 'hello', highlight: false }])
  })
})
