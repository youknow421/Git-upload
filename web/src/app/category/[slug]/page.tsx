import { products } from '@/lib/data'
import { notFound } from 'next/navigation'
import { CategoryFeed } from '@/components/CategoryFeed'
import Link from 'next/link'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean)
  return categories.map(category => ({
    slug: category,
  }))
}

export function generateMetadata({ params }: Props) {
  const displayName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return {
    title: `${displayName} | Project MVP`,
    description: `Browse ${displayName} products`,
  }
}

export default function CategoryPage({ params }: Props) {
  const categoryProducts = products.filter(p => p.category === params.slug)
  
  if (categoryProducts.length === 0) {
    notFound()
  }

  const displayName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div>
      <div className="mb-6">
        <Link href="/categories" className="text-indigo-600 hover:text-indigo-700 text-sm mb-2 inline-block">
          ← All Categories
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
      </div>

      <CategoryFeed products={categoryProducts} categoryName={displayName} />
    </div>
  )
}
