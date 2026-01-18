import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import api, { Product } from '../src/api'

export function CategoriesScreen({ navigation }: any) {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadProducts(selectedCategory)
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const res = await api.getCategories()
      setCategories(res.categories)
      if (res.categories.length > 0) {
        setSelectedCategory(res.categories[0])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async (category: string) => {
    try {
      const res = await api.getProducts({ category })
      setProducts(res.products)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      fashion: '👔',
      electronics: '📱',
      home: '🏠',
      furniture: '🛋️',
      accessories: '👜',
      travel: '✈️',
    }
    return icons[category.toLowerCase()] || '📦'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      fashion: '#ec4899',
      electronics: '#3b82f6',
      home: '#22c55e',
      furniture: '#f59e0b',
      accessories: '#8b5cf6',
      travel: '#06b6d4',
    }
    return colors[category.toLowerCase()] || '#6b7280'
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === item && {
                  backgroundColor: getCategoryColor(item),
                }
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={styles.categoryIcon}>{getCategoryIcon(item)}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive
              ]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No products in this category</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('Product', { id: item.id })}
          >
            <View style={styles.imageContainer}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>📷</Text>
                </View>
              )}
              {item.stock <= 5 && item.stock > 0 && (
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>Only {item.stock} left</Text>
                </View>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.productMeta}>
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                {item.rating > 0 && (
                  <Text style={styles.productRating}>⭐ {item.rating.toFixed(1)}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 40,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
    height: 40,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4f46e5',
  },
  productRating: {
    fontSize: 12,
    color: '#6b7280',
  },
})
