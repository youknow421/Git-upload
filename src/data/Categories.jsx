import { products } from '@project-mvp/common'

const counts = products.reduce((acc, p) => {
  const c = p.category || 'uncategorized'
  acc[c] = (acc[c] || 0) + 1
  return acc
}, {})

const categories = Object.keys(counts).map(slug => ({
  slug,
  name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  count: counts[slug]
})).sort((a,b) => a.name.localeCompare(b.name))

export default categories