import type { Product } from './types'

export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  if (textLower.includes(queryLower)) return true
  
  // character matching
  let queryIndex = 0
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++
    }
  }
  return queryIndex === queryLower.length
}

export function fuzzyScore(text: string, query: string): number {
  if (!query) return 0
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  if (textLower === queryLower) return 1000
  
  if (textLower.startsWith(queryLower)) return 800
  
  const index = textLower.indexOf(queryLower)
  if (index !== -1) return 600 - index
  
  let queryIndex = 0
  let lastMatchIndex = -1
  let gaps = 0
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      if (lastMatchIndex !== -1) {
        gaps += i - lastMatchIndex - 1
      }
      lastMatchIndex = i
      queryIndex++
    }
  }
  
  if (queryIndex === queryLower.length) {
    return Math.max(100 - gaps * 10, 1)
  }
  
  return 0
}

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products
  
  const scored = products
    .map((product) => {
      const nameScore = fuzzyScore(product.name, query)
      const descScore = fuzzyScore(product.description, query) * 0.5
      const categoryScore = product.category ? fuzzyScore(product.category, query) * 0.3 : 0
      return {
        product,
        score: nameScore + descScore + categoryScore,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
  
  return scored.map((item) => item.product)
}

export function highlightMatch(text: string, query: string): { text: string; highlight: boolean }[] {
  if (!query) return [{ text, highlight: false }]
  
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  const index = textLower.indexOf(queryLower)
  
  if (index !== -1) {
    return [
      { text: text.slice(0, index), highlight: false },
      { text: text.slice(index, index + query.length), highlight: true },
      { text: text.slice(index + query.length), highlight: false },
    ].filter((part) => part.text.length > 0)
  }
  
  return [{ text, highlight: false }]
}
