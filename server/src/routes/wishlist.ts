import { Router, Request, Response } from 'express'
import { requireAuth, AuthenticatedRequest } from '../auth.js'
import * as productsDb from '../products.js'

const router = Router()

// Get user's wishlist
router.get('/', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const products = productsDb.getWishlist(authReq.user!.id)
  
  res.json({
    items: products,
    count: products.length,
  })
})

// Check if product is in wishlist
router.get('/check/:productId', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const inWishlist = productsDb.isInWishlist(authReq.user!.id, req.params.productId)
  
  res.json({ inWishlist })
})

// Add product to wishlist
router.post('/:productId', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const added = productsDb.addToWishlist(authReq.user!.id, req.params.productId)
  
  if (!added) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const products = productsDb.getWishlist(authReq.user!.id)
  res.json({ 
    success: true,
    items: products,
    count: products.length,
  })
})

// Toggle product in wishlist
router.post('/:productId/toggle', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const product = productsDb.getProduct(req.params.productId)
  
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const isNowInWishlist = productsDb.toggleWishlistItem(authReq.user!.id, req.params.productId)
  const products = productsDb.getWishlist(authReq.user!.id)
  
  res.json({
    inWishlist: isNowInWishlist,
    items: products,
    count: products.length,
  })
})

// Remove product from wishlist
router.delete('/:productId', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  const removed = productsDb.removeFromWishlist(authReq.user!.id, req.params.productId)
  
  if (!removed) {
    res.status(404).json({ error: 'Item not in wishlist' })
    return
  }

  const products = productsDb.getWishlist(authReq.user!.id)
  res.json({
    success: true,
    items: products,
    count: products.length,
  })
})

// Clear wishlist
router.delete('/', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  productsDb.clearWishlist(authReq.user!.id)
  
  res.json({
    success: true,
    items: [],
    count: 0,
  })
})

export default router
