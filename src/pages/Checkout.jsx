import React, { useState } from 'react'
import { useCart, useOrders } from '../context/CartContext'
import { buildAutoSubmitFormHtml } from '@project-mvp/common'
import api from '../api/client'

export default function Checkout(){
  const { itemsArray, totalPrice, clear } = useCart()
  const { createOrder } = useOrders()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    setStatus('Creating order...')

    try {
      // Create order via backend API
      const orderItems = itemsArray.map(item => ({
        productId: item.id,
        name: item.name,
        price: Math.round(item.price * 100), // convert to cents
        quantity: item.quantity
      }))

      const response = await api.createOrder({
        items: orderItems,
        total: Math.round(totalPrice * 100),
        customerName: name,
        customerEmail: email,
      })

      // Also save to local state
      await createOrder(orderItems, response.order.total)
      
      setStatus('Redirecting to payment...')

      const { payment } = response

      if (payment.isMock) {
        // Mock payment - simulate success after delay
        setStatus('Mock payment mode - simulating payment...')
        setTimeout(async () => {
          await api.mockWebhook(response.order.id, 'success')
          window.location.href = `/checkout/success?orderId=${response.order.id}`
        }, 1500)
      } else {
        // Real Tranzilla payment - redirect to payment page
        const html = buildAutoSubmitFormHtml({
          url: payment.url,
          payload: payment.payload,
          sessionId: payment.sessionId,
        })
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setStatus('Payment window opened. Complete payment there.')
      }

      setOrderPlaced(true)
      clear()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not create order. Please try again.')
      setStatus('')
    }
  }

  if(orderPlaced) return (
    <div>
      <h2>Thank you!</h2>
      <p>Your order was placed.</p>
      {status && <p style={{color:'#6b7280'}}>{status}</p>}
    </div>
  )

  return (
    <section>
      <h2>Checkout</h2>
      <p>Items: {itemsArray.length} • Total: ${totalPrice.toFixed(2)}</p>
      {error && <p style={{color:'#ef4444'}}>{error}</p>}
      {status && <p style={{color:'#6b7280'}}>{status}</p>}
      <form onSubmit={onSubmit} style={{display:'grid',gap:8,maxWidth:420}}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <button type="submit" className="btn btn-primary" disabled={itemsArray.length === 0}>
          Pay with Tranzilla
        </button>
      </form>
    </section>
  )
}