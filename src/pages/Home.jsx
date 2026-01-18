import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { products } from '@project-mvp/common'
import ProductCard from '../components/ProductCard'

export default function Home(){
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))).filter(Boolean), [])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory && p.category !== selectedCategory) return false
      if (q) {
        const text = (p.name + ' ' + p.description).toLowerCase()
        if (!text.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [selectedCategory, q])

  return (
    <section>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <h2 style={{margin:0}}>Products</h2>
          <p style={{color:'#6b7280',margin:0}}>Browse all products or filter by category / search by name.</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <label htmlFor="search" style={{display:'none'}}>Search products</label>
          <input id="search" className="search-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." />
          <Link to="/categories"><button className="btn">View categories</button></Link>
        </div>
      </header>

      <div className="filters" style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}} role="toolbar" aria-label="Category filters">
        <button onClick={() => setSelectedCategory('')} aria-pressed={!selectedCategory} className={`btn ${!selectedCategory ? 'btn-primary' : ''}`}>All</button>
        {categories.map(c => (
          <button key={c} onClick={() => setSelectedCategory(c)} aria-pressed={selectedCategory === c} className={`btn ${selectedCategory === c ? 'btn-primary' : ''}`}>{c.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</button>
        ))}
        {selectedCategory && <button onClick={() => setSelectedCategory('')} className="btn">Clear</button>}
      </div>

      <div style={{display:'grid',gap:12}} aria-live="polite">
        {filtered.length === 0 ? (
          <div>No products match your filters.</div>
        ) : (
          filtered.map(p => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      <section style={{marginTop:20}}>
        <h3 style={{marginBottom:8}}>Quick categories</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {categories.map(c => (
            <Link key={c} to={`/category/${c}`} style={{textDecoration:'none'}}>
              <button className="btn">{c.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</button>
            </Link>
          ))}
        </div>
      </section>
    </section>
  )
}