import type { Product } from './types'
import { products } from './products'

export async function fetchProducts(): Promise<Product[]> {
  // In-memory data for dev. replace with network call later
  return Promise.resolve(products)
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  return Promise.resolve(products.find((p) => p.id === id))
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  return Promise.resolve(products.find((p) => (p as any).slug === slug || p.name.toLowerCase().includes(slug.toLowerCase())))
}

export async function searchProducts(q: string): Promise<Product[]> {
  const term = q.trim().toLowerCase()
  if (!term) return Promise.resolve(products)
  return Promise.resolve(products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(term)))
}
