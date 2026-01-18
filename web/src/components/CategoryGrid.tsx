import Link from 'next/link'

interface CategoryGridProps {
  categories: string[]
}

const categoryIcons: Record<string, string> = {
  electronics: '📱',
  clothing: '👕',
  'home-garden': '🏡',
  sports: '⚽',
  books: '📚',
  toys: '🧸',
  beauty: '💄',
  food: '🍕',
}

const categoryColors: Record<string, string> = {
  electronics: 'from-blue-500 to-blue-600',
  clothing: 'from-pink-500 to-pink-600',
  'home-garden': 'from-green-500 to-green-600',
  sports: 'from-orange-500 to-orange-600',
  books: 'from-purple-500 to-purple-600',
  toys: 'from-yellow-500 to-yellow-600',
  beauty: 'from-rose-500 to-rose-600',
  food: 'from-red-500 to-red-600',
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-600">Find exactly what you're looking for</p>
        </div>
        <Link href="/categories" className="text-indigo-600 hover:text-indigo-700 font-medium">
          All Categories →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(category => {
          const icon = categoryIcons[category] || '📦'
          const gradient = categoryColors[category] || 'from-gray-500 to-gray-600'
          const displayName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          
          return (
            <Link 
              key={category} 
              href={`/category/${category}`}
              className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white text-center hover:shadow-lg transition-shadow group`}
            >
              <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">
                {icon}
              </span>
              <span className="font-medium">{displayName}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
