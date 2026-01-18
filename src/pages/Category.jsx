import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '@project-mvp/common'
import ProductCard from '../components/ProductCard'

export default function Category(){
  const { category } = useParams()
  const list = products.filter(p => p.category === category)
  const title = category ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category'

  if (!list.length) {
    return (
      <section>
        <h2>{title}</h2>
        <p>No products found in this category.</p>
        <Link to="/categories">Back to categories</Link>
      </section>
    )
  }

  return (
    <section>
      <h2 style={{marginTop:0}}>{title}</h2>
      <div style={{display:'grid',gap:12}}>
        {list.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}