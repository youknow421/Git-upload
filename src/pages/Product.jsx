import React from 'react'
import { useParams } from 'react-router-dom'
import { products } from '@project-mvp/common'
import { useCart, useWishlist } from '../context/CartContext'

export default function Product(){
  const { slug } = useParams()
  const product = products.find(p => p.slug === slug)
  const { add } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  if(!product) return <div>Product not found</div>
  
  const inWishlist = isInWishlist(product.slug)
  
  return (
    <article>
      <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>
        <img src={product.image} alt={product.name} style={{width:280,height:180,objectFit:'cover',borderRadius:8}} />
        <div>
          <h2>{product.name}</h2>
          <p style={{color:'#6b7280'}}>${product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <button onClick={() => add(product,1)} className="btn btn-primary">Add to cart</button>
            <button 
              onClick={() => toggleWishlist(product.slug)} 
              className="btn" 
              style={{
                backgroundColor: inWishlist ? '#ff6b6b' : '#e5e7eb',
                color: inWishlist ? 'white' : 'inherit'
              }}
            >
              {inWishlist ? '❤️ Remove' : '🤍 Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}