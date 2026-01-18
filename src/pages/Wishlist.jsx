import { Link } from 'react-router-dom'
import { useWishlist } from '../context/CartContext'
import { products } from '@project-mvp/common'

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist()
  const wishlistProducts = products.filter((p) => items.includes(p.slug))

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>My Wishlist</h1>
      {wishlistProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>Your wishlist is empty.</p>
          <Link to="/" className="btn" style={{ display: 'inline-block', marginTop: '20px' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '20px', opacity: 0.7 }}>
            {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} in your wishlist
          </p>
          <div className="products-grid">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="product-card" style={{ position: 'relative' }}>
                <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ overflow: 'hidden', height: '200px', marginBottom: '12px', borderRadius: '4px' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <h3 style={{ margin: '12px 0 4px', fontSize: '16px', fontWeight: 'bold' }}>{product.name}</h3>
                  <p style={{ margin: '0 0 12px', fontSize: '14px', opacity: 0.7 }}>${product.price.toFixed(2)}</p>
                </Link>
                <button
                  onClick={() => removeFromWishlist(product.slug)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Remove from Wishlist
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
