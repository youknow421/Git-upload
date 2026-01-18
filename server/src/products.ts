// Products, Search, Wishlist, and other stuff im too lazy to write about
import { v4 as uuidv4 } from 'uuid'

//TYypes

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  description: string
  image: string
  stock: number
  category: string
  rating: number
  reviewCount: number
  createdAt: Date
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number // 1 to 5 stars
  title: string
  content: string
  verified: boolean // purchased the product
  helpful: number
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  userId: string
  productId: string
  addedAt: Date
}

// iN-MEMORY STORES

const products = new Map<string, Product>()
const reviews = new Map<string, Review>()
const wishlists = new Map<string, WishlistItem[]>() // userId -> items
const helpfulVotes = new Set<string>() // `userId:reviewId`

// Seed products

const seedProducts: Omit<Product, 'rating' | 'reviewCount' | 'createdAt'>[] = [
  { id: '1', slug: 'classic-sneakers', name: 'Classic Sneakers', price: 69.99, description: 'Comfortable everyday sneakers with a timeless silhouette.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop', stock: 12, category: 'fashion' },
  { id: '2', slug: 'slim-hoodie', name: 'Slim Hoodie', price: 49.99, description: 'A soft, slim-fit hoodie for cooler days.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop', stock: 8, category: 'fashion' },
  { id: '3', slug: 'travel-backpack', name: 'Travel Backpack', price: 89.99, description: 'Durable backpack with multiple compartments and laptop sleeve.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop', stock: 5, category: 'travel' },
  { id: '4', slug: 'minimal-watch', name: 'Minimal Watch', price: 129.99, description: 'Elegant, minimal watch with a leather strap.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop', stock: 3, category: 'accessories' },
  { id: '5', slug: 'aviator-sunglasses', name: 'Aviator Sunglasses', price: 29.99, description: 'Classic aviators offering UV protection and style.', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop', stock: 20, category: 'accessories' },
  { id: '6', slug: 'wireless-earbuds', name: 'Wireless Earbuds', price: 59.99, description: 'Noise-isolating earbuds with long battery life.', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop', stock: 15, category: 'electronics' },
  { id: '7', slug: 'ceramic-mug', name: 'Ceramic Mug', price: 12.99, description: 'A simple ceramic mug for everyday use.', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=400&fit=crop', stock: 30, category: 'home' },
  { id: '8', slug: 'oak-side-table', name: 'Oak Side Table', price: 199.99, description: 'Solid oak side table finished with natural oil.', image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=600&h=400&fit=crop', stock: 4, category: 'furniture' },
  { id: '9', slug: 'portable-charger', name: 'Portable Charger', price: 39.99, description: 'High-capacity USB-C power bank for travel.', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=400&fit=crop', stock: 18, category: 'electronics' },
  { id: '10', slug: 'travel-adapter-kit', name: 'Travel Adapter Kit', price: 24.99, description: 'Universal adapter kit for international travel.', image: 'https://images.unsplash.com/photo-1621319332247-ce870cdad56c?w=600&h=400&fit=crop', stock: 25, category: 'travel' },
]

// Initialize
seedProducts.forEach(p => {
  products.set(p.id, {
    ...p,
    rating: 0,
    reviewCount: 0,
    createdAt: new Date(),
  })
})

// Product functions

export function getAllProducts(): Product[] {
  return Array.from(products.values())
}

export function getProduct(id: string): Product | undefined {
  return products.get(id)
}

export function getProductBySlug(slug: string): Product | undefined {
  return Array.from(products.values()).find(p => p.slug === slug)
}

export function getCategories(): string[] {
  const categories = new Set<string>()
  products.forEach(p => categories.add(p.category))
  return Array.from(categories).sort()
}

// Search(I feel like i already made this but whatever)

export interface SearchOptions {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}

export interface SearchResult {
  products: Product[]
  total: number
  page: number
  totalPages: number
  query?: string
  filters: {
    categories: string[]
    priceRange: { min: number; max: number }
  }
}

export function searchProducts(options: SearchOptions = {}): SearchResult {
  const {
    query,
    category,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sortBy = 'relevance',
    page = 1,
    limit = 20,
  } = options

  let results = getAllProducts()

  // Text search
  if (query) {
    const q = query.toLowerCase().trim()
    results = results.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )

    // Score by relevance (name match -> description match)
    if (sortBy === 'relevance') {
      results = results.map(p => ({
        ...p,
        _score: (p.name.toLowerCase().includes(q) ? 10 : 0) +
                (p.name.toLowerCase().startsWith(q) ? 5 : 0) +
                (p.category.toLowerCase() === q ? 3 : 0)
      })).sort((a, b) => (b as any)._score - (a as any)._score)
    }
  }

  // Category filter
  if (category) {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase())
  }

  // Price filter
  if (minPrice !== undefined) {
    results = results.filter(p => p.price >= minPrice)
  }
  if (maxPrice !== undefined) {
    results = results.filter(p => p.price <= maxPrice)
  }

  // Rating filter
  if (minRating !== undefined) {
    results = results.filter(p => p.rating >= minRating)
  }

  // Stock filter
  if (inStock) {
    results = results.filter(p => p.stock > 0)
  }

  // Sorting
  switch (sortBy) {
    case 'price-asc':
      results.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      results.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      results.sort((a, b) => b.rating - a.rating)
      break
    case 'newest':
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      break
  }

  // Get filters info
  const allProducts = getAllProducts()
  const prices = allProducts.map(p => p.price)

  const total = results.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginated = results.slice(offset, offset + limit)

  return {
    products: paginated,
    total,
    page,
    totalPages,
    query,
    filters: {
      categories: getCategories(),
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
    },
  }
}

//Review(Coming on empty)

export function getProductReviews(productId: string): Review[] {
  return Array.from(reviews.values())
    .filter(r => r.productId === productId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function getUserReviews(userId: string): Review[] {
  return Array.from(reviews.values())
    .filter(r => r.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function getReview(reviewId: string): Review | undefined {
  return reviews.get(reviewId)
}

export function createReview(data: {
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  verified?: boolean
}): Review {
  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // Check if user already reviewed this product
  const existing = Array.from(reviews.values()).find(
    r => r.productId === data.productId && r.userId === data.userId
  )
  if (existing) {
    throw new Error('You have already reviewed this product')
  }

  const review: Review = {
    id: `rev_${uuidv4().slice(0, 12)}`,
    productId: data.productId,
    userId: data.userId,
    userName: data.userName,
    rating: data.rating,
    title: data.title,
    content: data.content,
    verified: data.verified || false,
    helpful: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  reviews.set(review.id, review)
  updateProductRating(data.productId)

  return review
}

export function updateReview(reviewId: string, userId: string, data: {
  rating?: number
  title?: string
  content?: string
}): Review | null {
  const review = reviews.get(reviewId)
  if (!review || review.userId !== userId) {
    return null
  }

  if (data.rating !== undefined) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }
    review.rating = data.rating
  }
  if (data.title !== undefined) review.title = data.title
  if (data.content !== undefined) review.content = data.content
  review.updatedAt = new Date()

  reviews.set(reviewId, review)
  updateProductRating(review.productId)

  return review
}

export function deleteReview(reviewId: string, userId: string): boolean {
  const review = reviews.get(reviewId)
  if (!review || review.userId !== userId) {
    return false
  }

  reviews.delete(reviewId)
  updateProductRating(review.productId)

  return true
}

export function markReviewHelpful(reviewId: string, userId: string): boolean {
  const key = `${userId}:${reviewId}`
  if (helpfulVotes.has(key)) {
    return false
  }

  const review = reviews.get(reviewId)
  if (!review) return false

  helpfulVotes.add(key)
  review.helpful++
  reviews.set(reviewId, review)

  return true
}

function updateProductRating(productId: string): void {
  const product = products.get(productId)
  if (!product) return

  const productReviews = getProductReviews(productId)
  if (productReviews.length === 0) {
    product.rating = 0
    product.reviewCount = 0
  } else {
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0)
    product.rating = Math.round((sum / productReviews.length) * 10) / 10
    product.reviewCount = productReviews.length
  }

  products.set(productId, product)
}

//Wishlist

export function getWishlist(userId: string): Product[] {
  const items = wishlists.get(userId) || []
  return items
    .map(item => products.get(item.productId))
    .filter((p): p is Product => p !== undefined)
}

export function getWishlistItems(userId: string): WishlistItem[] {
  return wishlists.get(userId) || []
}

export function isInWishlist(userId: string, productId: string): boolean {
  const items = wishlists.get(userId) || []
  return items.some(item => item.productId === productId)
}

export function addToWishlist(userId: string, productId: string): boolean {
  if (!products.has(productId)) {
    return false
  }

  let items = wishlists.get(userId) || []
  
  if (items.some(item => item.productId === productId)) {
    return true // Already in wishlist
  }

  items.push({
    userId,
    productId,
    addedAt: new Date(),
  })

  wishlists.set(userId, items)
  return true
}

export function removeFromWishlist(userId: string, productId: string): boolean {
  let items = wishlists.get(userId) || []
  const newItems = items.filter(item => item.productId !== productId)
  
  if (newItems.length === items.length) {
    return false // Not found
  }

  wishlists.set(userId, newItems)
  return true
}

export function clearWishlist(userId: string): void {
  wishlists.set(userId, [])
}

export function toggleWishlistItem(userId: string, productId: string): boolean {
  if (isInWishlist(userId, productId)) {
    removeFromWishlist(userId, productId)
    return false
  } else {
    addToWishlist(userId, productId)
    return true
  }
}

// Coupon

export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  validFrom: Date
  validUntil: Date
  active: boolean
}

const coupons = new Map<string, Coupon>()

//sample coupons
const seedCoupons: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 2000, // $20
    maxDiscount: 5000, // $50
    usageLimit: undefined,
    usageCount: 0,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2026-12-31'),
    active: true,
  },
  {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 5000, // $50
    maxDiscount: 10000, // $100
    usageLimit: 100,
    usageCount: 23,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2026-12-31'),
    active: true,
  },
  {
    code: 'FLAT500',
    type: 'fixed',
    value: 500, // $5 off
    minOrderAmount: 3000, // $30
    usageLimit: undefined,
    usageCount: 0,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2026-12-31'),
    active: true,
  },
]

seedCoupons.forEach(c => coupons.set(c.code.toUpperCase(), c))

export interface CouponValidationResult {
  valid: boolean
  error?: string
  coupon?: Coupon
  discount?: number
}

export function validateCoupon(code: string, orderTotal: number): CouponValidationResult {
  const coupon = coupons.get(code.toUpperCase())
  
  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' }
  }

  if (!coupon.active) {
    return { valid: false, error: 'This coupon is no longer active' }
  }

  const now = new Date()
  if (now < coupon.validFrom) {
    return { valid: false, error: 'This coupon is not yet valid' }
  }
  if (now > coupon.validUntil) {
    return { valid: false, error: 'This coupon has expired' }
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: 'This coupon has reached its usage limit' }
  }

  if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
    return { 
      valid: false, 
      error: `Minimum order of $${(coupon.minOrderAmount / 100).toFixed(2)} required` 
    }
  }

  // Calculate discount
  let discount: number
  if (coupon.type === 'percentage') {
    discount = Math.round(orderTotal * (coupon.value / 100))
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount)
    }
  } else {
    discount = coupon.value
  }

 
  discount = Math.min(discount, orderTotal)

  return {
    valid: true,
    coupon,
    discount,
  }
}

export function applyCoupon(code: string): boolean {
  const coupon = coupons.get(code.toUpperCase())
  if (coupon) {
    coupon.usageCount++
    return true
  }
  return false
}

export function getCoupon(code: string): Coupon | undefined {
  return coupons.get(code.toUpperCase())
}

// Related products

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const product = products.get(productId)
  if (!product) return []

  // get products in same category, excluding the current product
  let related = Array.from(products.values())
    .filter(p => p.id !== productId && p.category === product.category)
    .sort((a, b) => b.rating - a.rating)

  // If not enough products in same category, add from other categories
  if (related.length < limit) {
    const others = Array.from(products.values())
      .filter(p => p.id !== productId && p.category !== product.category)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit - related.length)
    related = [...related, ...others]
  }

  return related.slice(0, limit)
}

// Recently viewed(I love wasting time on stuff that was never asked for!!!!)

const recentlyViewed = new Map<string, string[]>() // userId -> productIds (most recent first)
const MAX_RECENTLY_VIEWED = 10

export function trackProductView(userId: string, productId: string): void {
  if (!products.has(productId)) return

  let viewed = recentlyViewed.get(userId) || []
  
  // Remove if already exists (will re-add at front)
  viewed = viewed.filter(id => id !== productId)
  
  // Add to front
  viewed.unshift(productId)
  
  // Keep only last N items
  if (viewed.length > MAX_RECENTLY_VIEWED) {
    viewed = viewed.slice(0, MAX_RECENTLY_VIEWED)
  }

  recentlyViewed.set(userId, viewed)
}

export function getRecentlyViewed(userId: string, limit: number = 5): Product[] {
  const viewed = recentlyViewed.get(userId) || []
  return viewed
    .slice(0, limit)
    .map(id => products.get(id))
    .filter((p): p is Product => p !== undefined)
}

export function clearRecentlyViewed(userId: string): void {
  recentlyViewed.set(userId, [])
}
