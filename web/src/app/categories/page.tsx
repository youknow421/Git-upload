import Link from 'next/link'
import { products } from '@/lib/data'

const categoryInfo: Record<string, { icon: string; color: string; description: string }> = {
  electronics: { 
    icon: '📱', 
    color: 'from-blue-500 to-blue-600',
    description: 'Phones, laptops, gadgets and more'
  },
  clothing: { 
    icon: '👕', 
    color: 'from-pink-500 to-pink-600',
    description: 'Fashion for every style'
  },
  'home-garden': { 
    icon: '🏡', 
    color: 'from-green-500 to-green-600',
    description: 'Everything for your home'
  },
  sports: { 
    icon: '⚽', 
    color: 'from-orange-500 to-orange-600',
    description: 'Sports equipment and gear'
  },
  books: { 
    icon: '📚', 
    color: 'from-purple-500 to-purple-600',
    description: 'Books for every reader'
  },
  toys: { 
    icon: '🧸', 
    color: 'from-yellow-500 to-yellow-600',
    description: 'Fun for all ages'
  },
  beauty: { 
    icon: '💄', 
    color: 'from-rose-500 to-rose-600',
    description: 'Beauty and personal care'
  },
  food: { 
    icon: '🍕', 
    color: 'from-red-500 to-red-600',
    description: 'Delicious treats and groceries'
  },
}

export const metadata = {
  title: 'Categories | Project MVP',
  description: 'Browse all product categories',
}

export default function CategoriesPage() {
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean) as string[]
  
  // Count products per category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">Browse products by category</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const info = categoryInfo[category] || { 
            icon: '📦', 
            color: 'from-gray-500 to-gray-600',
            description: 'Browse products'
          }
          const displayName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          const count = categoryCounts[category]
          
          return (
            <Link 
              key={category} 
              href={`/category/${category}`}
              className="card group hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className={`bg-gradient-to-br ${info.color} p-8 text-white text-center`}>
                <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">
                  {info.icon}
                </span>
                <h2 className="text-xl font-bold">{displayName}</h2>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-2">{info.description}</p>
                <p className="text-indigo-600 font-medium">{count} products</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
