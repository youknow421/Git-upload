import type { Product } from './types'

export const products: Product[] = [
  { id: '1', slug: 'classic-sneakers', name: 'Classic Sneakers', price: 69.99, description: 'Comfortable everyday sneakers with a timeless silhouette.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop', stock: 12, category: 'fashion' },
  { id: '2', slug: 'slim-hoodie', name: 'Slim Hoodie', price: 49.99, description: 'A soft, slim-fit hoodie for cooler days.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop', stock: 8, category: 'fashion' },
  { id: '3', slug: 'travel-backpack', name: 'Travel Backpack', price: 89.99, description: 'Durable backpack with multiple compartments and laptop sleeve.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop', stock: 5, category: 'travel' },
  { id: '4', slug: 'minimal-watch', name: 'Minimal Watch', price: 129.99, description: 'Elegant, minimal watch with a leather strap.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop', stock: 3, category: 'accessories' },
  { id: '5', slug: 'aviator-sunglasses', name: 'Aviator Sunglasses', price: 29.99, description: 'Classic aviators offering UV protection and style.', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop', stock: 20, category: 'accessories' },
  { id: '6', slug: 'wireless-earbuds', name: 'Wireless Earbuds', price: 59.99, description: 'Noise-isolating earbuds with long battery life.', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop', stock: 15, category: 'electronics' },
  { id: '7', slug: 'ceramic-mug', name: 'Ceramic Mug', price: 12.99, description: 'A simple ceramic mug for everyday use.', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=400&fit=crop', stock: 30, category: 'home' },
  { id: '8', slug: 'oak-side-table', name: 'Oak Side Table', price: 199.99, description: 'Solid oak side table finished with natural oil.', image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=600&h=400&fit=crop', stock: 4, category: 'furniture' },
  { id: '9', slug: 'portable-charger', name: 'Portable Charger', price: 39.99, description: 'High-capacity USB-C power bank for travel.', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=400&fit=crop', stock: 18, category: 'electronics' },
  { id: '10', slug: 'travel-adapter-kit', name: 'Travel Adapter Kit', price: 24.99, description: 'Universal adapter kit for international travel.', image: 'https://images.unsplash.com/photo-1621319332247-ce870cdad56c?w=600&h=400&fit=crop', stock: 25, category: 'travel' }
]
