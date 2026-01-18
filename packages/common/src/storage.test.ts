import { describe, it, expect } from 'vitest'
import { createInMemoryStorage, normalizeStorage } from './storage'

describe('storage helpers', () => {
  it('in-memory store works', async () => {
    const s = createInMemoryStorage()
    expect(s.getItem('x')).toBe(null)
    s.setItem('x', '1')
    expect(s.getItem('x')).toBe('1')
    s.removeItem('x')
    expect(s.getItem('x')).toBe(null)
  })

  it('normalizeStorage returns async methods', async () => {
    const s = normalizeStorage(createInMemoryStorage())
    await s.setItem('a', 'b')
    const v = await s.getItem('a')
    expect(v).toBe('b')
  })
})