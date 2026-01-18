import React, { useEffect, useState } from 'react'
import { SafeAreaView, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { fetchProducts } from '@project-mvp/common'

export default function HomeScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => { fetchProducts().then(setItems) }, [])
  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity onPress={() => navigation.navigate('Product', { id: item.id })} style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ root: { flex: 1, padding: 16 }, card: { padding: 12, borderRadius: 8, backgroundColor: '#f8fafc', marginBottom: 12 }, title: { fontSize: 16, fontWeight: '600' }, price: { color: '#6b7280' } })