import React from 'react'
import { Link } from 'react-router-dom'
import { products } from '@project-mvp/common'

export default function Categories(){
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean)
  return (
    <section>
      <h2>Categories</h2>
      <ul style={{display:'flex',gap:8,listStyle:'none',padding:0,flexWrap:'wrap'}}>
        {categories.map(c => (
          <li key={c}>
            <Link to={`/category/${c}`} style={{textDecoration:'none'}}>
              <button className="btn">{c.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</button>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}