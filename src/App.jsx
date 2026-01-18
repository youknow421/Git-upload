import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutCancel from './pages/CheckoutCancel'
import Orders from './pages/Orders'
import Categories from './pages/Categories'
import Category from './pages/Category'
import Wishlist from './pages/Wishlist'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import SearchOverlay from './components/SearchOverlay'
import { CartProvider, useCart, WishlistProvider, useWishlist, GroupProvider, useGroups, OrderProvider, useOrders } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Protected route wrapper
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function Header({ onSearchClick }){
  const { totalItems } = useCart()
  const { itemCount } = useWishlist()
  const { groups } = useGroups()
  const { orders } = useOrders()
  const { isAuthenticated, user } = useAuth()
  return (
    <header className="site-header">
      <Link to="/" style={{textDecoration:'none'}}><h1>Project MVP</h1></Link>
      <nav className="site-nav">
        <Link to="/">Home</Link>
        <Link to="/categories">Categories</Link>
        <button 
          onClick={onSearchClick}
          className="btn"
          style={{ 
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer'
          }}
        >
          🔍 Search
        </button>
        <Link to="/wishlist">Wishlist ({itemCount})</Link>
        <Link to="/groups">Groups ({groups.length})</Link>
        <Link to="/orders">Orders ({orders.length})</Link>
        <Link to="/cart">Cart ({totalItems})</Link>
        {isAuthenticated ? (
          <Link to="/profile" style={{ fontWeight: '500' }}>
            👤 {user?.name?.split(' ')[0] || 'Profile'}
          </Link>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  )
}

export default function App(){
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e) => {
      // CMD+K or CTRL+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      // Forward slash to open search
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <GroupProvider>
            <OrderProvider>
              <BrowserRouter>
                <main className="container" role="main">
                  <Header onSearchClick={() => setSearchOpen(true)} />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/category/:category" element={<Category />} />
                    <Route path="/product/:slug" element={<Product />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/groups/:groupId" element={<GroupDetail />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={
                      <RequireAuth>
                        <Checkout />
                      </RequireAuth>
                    } />
                    <Route path="/checkout/success" element={<CheckoutSuccess />} />
                    <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/profile" element={
                      <RequireAuth>
                        <Profile />
                      </RequireAuth>
                    } />
                  </Routes>
                  <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
                </main>
              </BrowserRouter>
            </OrderProvider>
          </GroupProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}