import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useOrders } from '../context/CartContext'
import api from '../api/client'

export default function CheckoutCancel() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { updateOrderStatus, setCurrentOrder } = useOrders()
  const [processing, setProcessing] = useState(true)
  
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    async function processCancellation() {
      if (!orderId) {
        setProcessing(false)
        return
      }

      try {
        // Update order status via backend
        await api.updateOrderStatus(orderId, 'cancelled')
        updateOrderStatus(orderId, 'cancelled')
        setCurrentOrder(null)
        console.log('Payment cancelled:', { orderId })
      } catch (err) {
        console.error('Error processing cancellation:', err)
        // Still update local state
        updateOrderStatus(orderId, 'cancelled')
        setCurrentOrder(null)
      } finally {
        setProcessing(false)
      }
    }

    processCancellation()
  }, [orderId, updateOrderStatus, setCurrentOrder])

  if (processing) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
        <h2>Processing...</h2>
      </div>
    )
  }

  return (
    <div className="page" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeeba',
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ color: '#856404', marginBottom: '15px' }}>Payment Cancelled</h2>
        <p style={{ color: '#856404', fontSize: '1.1rem', marginBottom: '30px' }}>
          Your payment was cancelled. No charges were made.
        </p>
        {orderId && (
          <p style={{ color: '#856404', marginBottom: '30px' }}>
            Order ID: <strong>{orderId}</strong>
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/checkout')} 
            className="btn"
            style={{ backgroundColor: '#ffc107' }}
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/cart')} 
            className="btn"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
