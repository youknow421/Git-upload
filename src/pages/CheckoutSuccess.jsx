import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useOrders } from '../context/CartContext'
import api from '../api/client'

export default function CheckoutSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { updateOrderStatus, setCurrentOrder } = useOrders()
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setProcessing(false)
        return
      }

      try {
        // Fetch order from backend to get current status
        const { order: fetchedOrder } = await api.getOrder(orderId)
        setOrder(fetchedOrder)
        
        // Update local state to match backend
        if (fetchedOrder.status === 'completed') {
          updateOrderStatus(orderId, 'completed')
        }
        
        setCurrentOrder(null)
        console.log('Order fetched:', fetchedOrder)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Could not fetch order details')
      } finally {
        setProcessing(false)
      }
    }

    fetchOrder()
  }, [orderId, updateOrderStatus, setCurrentOrder])

  if (processing) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
        <h2>Processing payment...</h2>
        <p>Please wait while we confirm your payment.</p>
      </div>
    )
  }

  const isSuccess = order?.status === 'completed'

  return (
    <div className="page" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
        border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{isSuccess ? '✅' : '⚠️'}</div>
        <h2 style={{ color: isSuccess ? '#155724' : '#721c24', marginBottom: '15px' }}>
          {isSuccess ? 'Payment Successful!' : error || 'Payment Processing'}
        </h2>
        <p style={{ color: isSuccess ? '#155724' : '#721c24', fontSize: '1.1rem', marginBottom: '30px' }}>
          {isSuccess 
            ? 'Thank you for your purchase. Your order has been confirmed.'
            : error || 'Your payment is being processed. Check your orders for status updates.'}
        </p>
        {order && (
          <p style={{ color: isSuccess ? '#155724' : '#721c24', marginBottom: '30px' }}>
            Order: <strong>{order.orderNumber}</strong>
          </p>
        )}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/orders')} 
            className="btn"
            style={{ backgroundColor: '#28a745' }}
          >
            View Orders
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
