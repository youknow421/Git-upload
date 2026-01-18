import React, { useEffect, useState } from 'react'
import { SafeAreaView, Text, Button, StyleSheet } from 'react-native'
import { fetchProductById, useCart } from '@project-mvp/common'

export default function ProductScreen({ route }: any) {
  const { id } = route.params
  const [product, setProduct] = useState<any>()
  const { add } = useCart()
  useEffect(() => { fetchProductById(id).then(setProduct) }, [id])
  if (!product) return <SafeAreaView style={styles.root}><Text>Loading…</Text></SafeAreaView>
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>{product.name}</Text>
      <Text style={{ marginBottom: 8 }}>{product.description}</Text>
      <Text style={{ color: '#6b7280', marginBottom: 12 }}>${product.price.toFixed(2)}</Text>
      <Button title="Add to cart" onPress={() => add(product, 1)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ root: { flex: 1, padding: 16 }, h1: { fontSize: 20, fontWeight: '700', marginBottom: 12 } })