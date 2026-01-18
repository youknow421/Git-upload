import { products as baseProducts } from '@project-mvp/common/src/products'

export interface Product {
  id: number
  name: string
  slug: string
  price: number
  description: string
  category?: string
  image: string
  stock?: number
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const products: Product[] = baseProducts.map(p => ({
  ...p,
  id: typeof p.id === 'string' ? parseInt(p.id, 10) : p.id,
  slug: createSlug(p.name),
})) as Product[]
