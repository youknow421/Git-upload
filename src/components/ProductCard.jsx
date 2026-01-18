import React from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/CartContext'

export default function ProductCard({ product }){
  const { isInWishlist, toggleWishlist } = useWishlist()
  const inWishlist = isInWishlist(product.slug)

  return (
    <article className="product-card" tabIndex={0} aria-labelledby={`p-${product.id}`}>
      <img className="product-image" src={product.image} alt={product.name} />
      <div className="product-body">
        <h3 id={`p-${product.id}`}>{product.name}</h3>
        <p className="muted">${product.price.toFixed(2)}</p>
        {product.category && (
          <Link to={`/category/${product.category}`} className="chip" aria-label={`Category ${product.category.replace(/-/g,' ')}`}>{product.category.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</Link>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link to={`/product/${product.slug}`} className="btn btn-ghost" style={{ flex: 1 }}>View</Link>
        <button
          onClick={() => toggleWishlist(product.slug)}
          className="btn"
          style={{
            backgroundColor: inWishlist ? '#ff6b6b' : '#e5e7eb',
            color: inWishlist ? 'white' : 'inherit',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px'
          }}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      </div>
    </article>
  )
}