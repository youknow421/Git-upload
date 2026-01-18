import { products } from '@/lib/data'
import { notFound } from 'next/navigation'
import { ProductDetail } from './ProductDetail'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return products.map(product => ({
    slug: product.slug,
  }))
}

export function generateMetadata({ params }: Props) {
  const product = products.find(p => p.slug === params.slug)
  if (!product) return { title: 'Product Not Found' }
  
  return {
    title: `${product.name} | Project MVP`,
    description: product.description,
  }
}

export default function ProductPage({ params }: Props) {
  const product = products.find(p => p.slug === params.slug)
  
  if (!product) {
    notFound()
  }

  return <ProductDetail product={product!} />
}
