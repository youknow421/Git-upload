import React from 'react'
import { SafeAreaView, Text, Button, StyleSheet } from 'react-native'
import { useCart } from '@project-mvp/common'

export default function CheckoutScreen({ navigation }: any) {
  const { clear } = useCart()
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>Checkout</Text>
      <Text style={{ marginBottom: 12 }}>Mock checkout — press Place Order to finish.</Text>
      <Button title="Place Order" onPress={() => { clear(); navigation.navigate('Home') }} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ root: { flex: 1, padding: 16 }, h1: { fontSize: 20, fontWeight: '700', marginBottom: 12 } })