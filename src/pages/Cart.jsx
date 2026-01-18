import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart(){
  const { itemsArray, totalItems, totalPrice, setQty, remove, clear } = useCart()
  return (
    <section>
      <h2>Shopping Cart</h2>
      {itemsArray.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/">Continue shopping</Link>
        </div>
      ) : (
        <div>
          <ul style={{listStyle:'none',padding:0}}>
            {itemsArray.map(it => (
              <li key={it.product.id} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f1f5f9'}}>
                <img src={it.product.image} alt="" style={{width:88,height:56,objectFit:'cover',borderRadius:6}} />
                <div style={{flex:1}}>
                  <strong>{it.product.name}</strong>
                  <div style={{color:'#6b7280'}}>${it.product.price.toFixed(2)}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <input type="number" min="1" value={it.qty} onChange={e => setQty(it.product.id, Number(e.target.value))} style={{width:64}} />
                  <button onClick={() => remove(it.product.id)} className="btn">Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{marginTop:12}}>
            <div style={{marginBottom:8}}>Items: {totalItems}</div>
            <div style={{marginBottom:8}}>Total: ${totalPrice.toFixed(2)}</div>
            <div style={{display:'flex',gap:8}}>
              <Link to="/checkout"><button className="btn btn-primary">Checkout</button></Link>
              <button onClick={clear} className="btn">Clear cart</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}