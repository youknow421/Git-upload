import { products } from '@/lib/data'
import { HeroSection } from '@/components/HeroSection'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { CategoryGrid } from '@/components/CategoryGrid'
import { ProductGrid } from '@/components/ProductGrid'
import { RecentlyViewed } from '@/components/RecentlyViewed'

export default function HomePage() {
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean) as string[]
  const featuredProducts = products.slice(0, 4)
  
  return (
    <div className="space-y-12">
      <HeroSection />

      {/* Recently Viewed - shown for logged in users */}
      <RecentlyViewed limit={5} />
      
      <FeaturedProducts products={featuredProducts} />
      
      <CategoryGrid categories={categories} />
      
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Products</h2>
            <p className="text-gray-600 dark:text-gray-400">Browse our complete collection</p>
          </div>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  )
}
