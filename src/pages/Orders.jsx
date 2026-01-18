import React from 'react'
import { useOrders } from '../context/CartContext'
import { Link } from 'react-router-dom'

export default function Orders() {
  const { orders } = useOrders()

  if (orders.length === 0) {
    return (
      <div className="page">
        <h2>My Orders</h2>
        <p>You haven't placed any orders yet.</p>
        <Link to="/" className="btn">Start Shopping</Link>
      </div>
    )
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return `$${(price / 100).toFixed(2)}`
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      processing: '#3498db',
      completed: '#27ae60',
      failed: '#e74c3c',
      cancelled: '#95a5a6'
    }
    return colors[status] || '#95a5a6'
  }

  return (
    <div className="page">
      <h2>My Orders</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((order) => (
          <div 
            key={order.id} 
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fff'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {formatDate(order.timestamp)}
                </p>
              </div>
              <div style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: getStatusColor(order.status),
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {order.status}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Items:</h4>
              {order.items.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none'
                  }}
                >
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '15px',
              borderTop: '2px solid #333',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>

            {order.paymentSessionId && (
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
                Payment Session: {order.paymentSessionId}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
