import { Router, Request, Response } from 'express'
import { requireAuth, AuthenticatedRequest } from '../auth.js'
import * as productsDb from '../products.js'

const router = Router()

//PRODUCTS

// Get all products with optional search/filter
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort,
      page,
      limit,
    } = req.query

    const result = productsDb.searchProducts({
      query: q as string,
      category: category as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      inStock: inStock === 'true',
      sortBy: sort as any,
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 20,
    })

    res.json(result)
  } catch (error) {
    console.error('Product search error:', error)
    res.status(500).json({ error: 'Failed to search products' })
  }
})

// Get product categories
router.get('/categories', (req: Request, res: Response) => {
  const categories = productsDb.getCategories()
  res.json({ categories })
})

// Search products (alias for GET / with q param)
router.get('/search', (req: Request, res: Response) => {
  try {
    const { q, ...rest } = req.query
    
    if (!q) {
      res.status(400).json({ error: 'Search query required' })
      return
    }

    const result = productsDb.searchProducts({
      query: q as string,
      category: rest.category as string,
      minPrice: rest.minPrice ? Number(rest.minPrice) : undefined,
      maxPrice: rest.maxPrice ? Number(rest.maxPrice) : undefined,
      sortBy: (rest.sort as any) || 'relevance',
      page: rest.page ? Number(rest.page) : 1,
      limit: rest.limit ? Math.min(Number(rest.limit), 100) : 20,
    })

    res.json(result)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

// RECENTLY VIEWED

// Get recently viewed products
router.get('/user/recently-viewed', requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 10) : 5
  const products = productsDb.getRecentlyViewed(authReq.user!.id, limit)
  res.json({ products })
})

// COUPONS

// Validate coupon
router.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, orderTotal } = req.body

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Coupon code required' })
    return
  }

  if (!orderTotal || typeof orderTotal !== 'number' || orderTotal <= 0) {
    res.status(400).json({ error: 'Valid order total required' })
    return
  }

  const result = productsDb.validateCoupon(code, orderTotal)
  
  if (!result.valid) {
    res.status(400).json({ error: result.error })
    return
  }

  res.json({
    valid: true,
    code: result.coupon!.code,
    type: result.coupon!.type,
    value: result.coupon!.value,
    discount: result.discount,
    discountFormatted: `$${(result.discount! / 100).toFixed(2)}`,
  })
})

// Get single product by ID
router.get('/:id', (req: Request, res: Response) => {
  const product = productsDb.getProduct(req.params.id)
  
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  res.json({ product })
})

// Get product by slug
router.get('/slug/:slug', (req: Request, res: Response) => {
  const product = productsDb.getProductBySlug(req.params.slug)
  
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  res.json({ product })
})

//REVIEWS

// Get reviews for a product
router.get('/:id/reviews', (req: Request, res: Response) => {
  const reviews = productsDb.getProductReviews(req.params.id)
  const product = productsDb.getProduct(req.params.id)
  
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  res.json({
    reviews,
    stats: {
      average: product.rating,
      count: product.reviewCount,
      distribution: calculateRatingDistribution(reviews),
    },
  })
})

// Create a review (requires auth)
router.post('/:id/reviews', requireAuth, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const { rating, title, content } = req.body

    if (!rating || !title || !content) {
      res.status(400).json({ error: 'Rating, title, and content are required' })
      return
    }

    const product = productsDb.getProduct(req.params.id)
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    const verified = false

    const review = productsDb.createReview({
      productId: req.params.id,
      userId: authReq.user!.id,
      userName: authReq.user!.email.split('@')[0],
      rating: Number(rating),
      title,
      content,
      verified,
    })

    res.status(201).json({ review })
  } catch (error: any) {
    console.error('Create review error:', error)
    res.status(400).json({ error: error.message || 'Failed to create review' })
  }
})


router.put('/:id/reviews/:reviewId', requireAuth, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest
    const { rating, title, content } = req.body

    const review = productsDb.updateReview(
      req.params.reviewId,
      authReq.user!.id,
      { rating: rating ? Number(rating) : undefined, title, content }
    )

    if (!review) {
      res.status(404).json({ error: 'Review not found or not authorized' })
      return
    }

    res.json({ review })
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update review' })
  }
})

// Delete a review
router.delete('/:id/reviews/:reviewId', requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  
  const deleted = productsDb.deleteReview(req.params.reviewId, authReq.user!.id)
  
  if (!deleted) {
    res.status(404).json({ error: 'Review not found or not authorized' })
    return
  }

  res.json({ success: true })
})

// Mark review as helpful
router.post('/:id/reviews/:reviewId/helpful', requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  
  const marked = productsDb.markReviewHelpful(req.params.reviewId, authReq.user!.id)
  
  if (!marked) {
    res.status(400).json({ error: 'Already marked or review not found' })
    return
  }

  res.json({ success: true })
})

// Calculate rating distribution
function calculateRatingDistribution(reviews: productsDb.Review[]): Record<number, number> {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(r => {
    dist[r.rating] = (dist[r.rating] || 0) + 1
  })
  return dist
}

//RELATED PRODUCTS

// Get related products
router.get('/:id/related', (req: Request, res: Response) => {
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 10) : 4
  const related = productsDb.getRelatedProducts(req.params.id, limit)
  res.json({ products: related })
})

// Track product view
router.post('/:id/view', requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  productsDb.trackProductView(authReq.user!.id, req.params.id)
  res.json({ success: true })
})

export default router
