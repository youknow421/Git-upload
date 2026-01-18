import React from 'react'
import { Link } from 'react-router-dom'
import categories from './Categories'

export default function Categories(){
  return (
    <section>
      <h2 style={{marginTop:0}}>Categories</h2>
      <div style={{display:'grid',gap:8}}>
        {categories.map(c => (
          <Link key={c.slug} to={`/category/${c.slug}`} style={{textDecoration:'none'}}>
            <article style={{padding:12,border:'1px solid #eef2ff',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <strong>{c.name}</strong>
                <div style={{color:'#6b7280',fontSize:13}}>{c.count} items</div>
              </div>
              <div style={{color:'#6b7280'}}>View →</div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}