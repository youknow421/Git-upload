import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { products, searchProducts, highlightMatch } from '@project-mvp/common'

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const results = searchProducts(products, query)
    setResults(results.slice(0, 8))
  }, [query])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="search-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideDown 0.3s ease-out',
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '18px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', marginBottom: 0 }}>
            Press ESC to close
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {query === '' ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <p>Start typing to search products...</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map((product) => {
                const nameHighlight = highlightMatch(product.name, query)
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      transition: 'background-color 0.2s',
                      backgroundColor: '#f8fafc',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e7ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        {nameHighlight.map((part, i) => (
                          <span
                            key={i}
                            style={{
                              backgroundColor: part.highlight ? '#fef08a' : 'transparent',
                              fontWeight: part.highlight ? 'bold' : 'normal',
                            }}
                          >
                            {part.text}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
