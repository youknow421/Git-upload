import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative px-8 py-16 md:py-24 text-white">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
            🎉 New Year Sale - Up to 30% Off
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Products
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Shop the latest trends and best deals. Join our community of savvy shoppers 
            and enjoy exclusive group discounts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/categories" className="btn bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3">
              Shop Now
            </Link>
            <Link href="/groups" className="btn bg-white/20 text-white hover:bg-white/30 px-6 py-3">
              Join a Group
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full" />
        <div className="absolute bottom-20 right-40 w-24 h-24 bg-white rounded-full" />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white rounded-full" />
      </div>
    </section>
  )
}
