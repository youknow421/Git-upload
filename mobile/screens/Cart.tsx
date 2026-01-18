import React from 'react'
import { SafeAreaView, Text, View, Button, StyleSheet } from 'react-native'
import { useCart } from '@project-mvp/common'

export default function CartScreen({ navigation }: any) {
  const { itemsArray, totalItems, totalPrice, remove, clear } = useCart()
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>Cart</Text>
      {itemsArray.length === 0 ? (
        <View><Text>Your cart is empty</Text></View>
      ) : (
        <View>
          {itemsArray.map((it: any) => (
            <View key={it.product.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{it.product.name}</Text>
                <Text style={styles.price}>${it.product.price.toFixed(2)}</Text>
              </View>
              <View style={{ width: 120 }}>
                <Button title="Remove" onPress={() => remove(it.product.id)} />
              </View>
            </View>
          ))}

          <View style={{ marginTop: 12 }}>
            <Text>Items: {totalItems}</Text>
            <Text>Total: ${totalPrice.toFixed(2)}</Text>
            <View style={{ marginTop: 8 }}>
              <Button title="Checkout" onPress={() => navigation.navigate('Checkout')} />
            </View>
            <View style={{ marginTop: 8 }}>
              <Button title="Clear" onPress={clear} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ root: { flex: 1, padding: 16 }, h1: { fontSize: 20, fontWeight: '700', marginBottom: 12 }, row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#f8fafc', marginBottom: 8 }, title: { fontSize: 16, fontWeight: '600' }, price: { color: '#6b7280' } })