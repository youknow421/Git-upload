import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { CartProvider, WishlistProvider, GroupProvider, OrderProvider, fetchProducts, fetchProductById, useCart, useWishlist, useGroups, useOrders, createInMemoryStorage, Product, searchProducts, highlightMatch, createTranzillaSession, loadTranzillaConfig, createMockSession } from '@project-mvp/common'
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Button, TextInput, Alert, Image, ScrollView } from 'react-native'
import { AuthProvider, useAuth } from './src/AuthContext'
import api, { Product as ApiProduct, Review } from './src/api'
import { LoginScreen } from './screens/LoginScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { NotificationsScreen } from './screens/NotificationsScreen'
import { CategoriesScreen } from './screens/CategoriesScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function HomeScreen({ navigation }: any) {
  const [items, setItems] = useState<Product[]>([])
  const { itemCount } = useWishlist()
  const { groups } = useGroups()
  const { orders } = useOrders()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProducts().then((list) => setItems(list))
  }, [])

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.homeHeader}>
        <Text style={styles.logo}>🛍️ Project MVP</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconButton}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.quickActionIcon}>📦</Text>
          <Text style={styles.quickActionText}>Orders</Text>
          {orders.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{orders.length}</Text></View>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Groups')}>
          <Text style={styles.quickActionIcon}>👥</Text>
          <Text style={styles.quickActionText}>Groups</Text>
          {groups.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{groups.length}</Text></View>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => isAuthenticated ? navigation.navigate('ProfileTab') : navigation.navigate('Login')}>
          <Text style={styles.quickActionIcon}>{isAuthenticated ? '👤' : '🔐'}</Text>
          <Text style={styles.quickActionText}>{isAuthenticated ? 'Profile' : 'Login'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Featured Products</Text>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(i: Product) => i.id}
        contentContainerStyle={styles.productGrid}
        renderItem={({ item }: { item: Product }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Product', { id: item.id })} style={styles.productCard}>
            <View style={styles.productImagePlaceholder}>
              <Text style={{ fontSize: 32 }}>📷</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

function ProductScreen({ route }: any) {
  const { id } = route.params
  const [product, setProduct] = useState<any>()
  const { add } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  useEffect(() => { fetchProductById(id).then(setProduct) }, [id])
  if (!product) return <SafeAreaView style={styles.root}><Text>Loading…</Text></SafeAreaView>
  
  const inWishlist = isInWishlist(product.slug)
  
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>{product.name}</Text>
      <Text style={{ marginBottom: 8 }}>{product.description}</Text>
      <Text style={{ color: '#6b7280', marginBottom: 12 }}>${product.price.toFixed(2)}</Text>
      <View style={{ gap: 8 }}>
        <Button title="Add to cart" onPress={() => add(product, 1)} />
        <Button 
          title={inWishlist ? "❤️ Remove from Wishlist" : "🤍 Add to Wishlist"}
          onPress={() => toggleWishlist(product.slug)}
          color={inWishlist ? '#ff6b6b' : '#666'}
        />
      </View>
    </SafeAreaView>
  )
}

function CartScreen({ navigation }: any) {
  const { itemsArray, totalItems, totalPrice, setQty, remove, clear } = useCart()
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>Cart</Text>
      {itemsArray.length === 0 ? (
        <View><Text>Your cart is empty</Text></View>
      ) : (
        <View>
          {itemsArray.map((it: any) => (
            <View key={it.product.id} style={styles.cardRow}>
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

function CheckoutScreen({ navigation }: any) {
  const { clear, totalPrice, itemsArray } = useCart()
  const { createOrder } = useOrders()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const handlePay = async () => {
    setError('')
    setStatus('Creating order...')
    try {
      const orderItems = itemsArray.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: Math.round(item.product.price * 100), // cents
        qty: item.qty,
      }))

      // Calculate totals
      const subtotal = Math.round(itemsArray.reduce((s, it) => s + it.product.price * it.qty, 0) * 100)
      const tax = Math.round(subtotal * 0.1)
      const total = subtotal + tax

      const orderId = createOrder({
        status: 'pending',
        orderNumber: `ORD-${Date.now()}`,
        items: orderItems,
        subtotal,
        tax,
        total,
        customerName: 'Mobile Customer',
        customerEmail: 'customer@example.com',
        paymentMethod: 'mock',
      })

      setStatus('Creating payment session...')
      const cfg = loadTranzillaConfig()
      const req = {
        amount: totalPrice,
        orderId: orderId,
        description: `Order ${orderId}`,
        customerName: 'Mobile Customer',
        customerEmail: 'customer@example.com',
        cancelUrl: 'myapp://checkout/cancel',
        successUrl: 'myapp://checkout/success',
      }
      const session = cfg ? createTranzillaSession(req, cfg) : createMockSession(req)
      setStatus(
        cfg
          ? `Tranzilla session ready (redirect handled by backend/web). Payload fields: ${Object.keys(session.payload).length}`
          : 'Mock payment completed (configure TRANZILLA_* to enable real payments).'
      )
      clear()
      navigation.navigate('Home')
    } catch (err) {
      console.error(err)
      setError('Could not create order or initiate payment. Please try again.')
      setStatus('')
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>Checkout</Text>
      <Text style={{ marginBottom: 12 }}>Total: ${totalPrice.toFixed(2)}</Text>
      {status ? <Text style={{ color: '#6b7280', marginBottom: 12 }}>{status}</Text> : null}
      {error ? <Text style={{ color: '#ef4444', marginBottom: 12 }}>{error}</Text> : null}
      <Button title="Pay with Tranzilla" onPress={handlePay} />
    </SafeAreaView>
  )
}

function OrdersScreen({ navigation }: any) {
  const { orders } = useOrders()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f39c12',
      processing: '#3498db',
      completed: '#27ae60',
      failed: '#e74c3c',
      cancelled: '#95a5a6',
    }
    return colors[status] || '#95a5a6'
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>My Orders</Text>
      {orders.length === 0 ? (
        <View>
          <Text style={{ color: '#6b7280' }}>You haven't placed any orders yet.</Text>
          <View style={{ marginTop: 12 }}>
            <Button title="Start Shopping" onPress={() => navigation.navigate('Home')} />
          </View>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={({ item: order }) => (
            <View style={[styles.card, { marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: '600' }}>Order #{order.orderNumber || order.id.slice(-8)}</Text>
                <View style={{ backgroundColor: getStatusColor(order.status), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>{order.status}</Text>
                </View>
              </View>
              <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{formatDate(new Date(order.createdAt).getTime())}</Text>
              {order.items.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                  <Text>{item.productName} × {item.qty}</Text>
                  <Text>{formatPrice(item.price * item.qty)}</Text>
                </View>
              ))}
              <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700' }}>Total</Text>
                <Text style={{ fontWeight: '700' }}>{formatPrice(order.total)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

function WishlistScreen({ navigation }: any) {
  const { items, removeFromWishlist } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    fetchProducts().then((allProducts) => {
      const wishlistProducts = allProducts.filter((p) => items.includes(p.slug))
      setProducts(wishlistProducts)
    })
  }, [items])
  
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>My Wishlist</Text>
      {products.length === 0 ? (
        <View>
          <Text>Your wishlist is empty.</Text>
          <View style={{ marginTop: 12 }}>
            <Button title="Continue Shopping" onPress={() => navigation.navigate('Home')} />
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(i: Product) => i.id}
          renderItem={({ item }: { item: Product }) => (
            <View style={styles.card}>
              <TouchableOpacity onPress={() => navigation.navigate('Product', { id: item.id })} style={{ flex: 1 }}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              </TouchableOpacity>
              <View style={{ width: 120 }}>
                <Button title="Remove" onPress={() => removeFromWishlist(item.slug)} color="#ff6b6b" />
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [results, setResults] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts().then(setAllProducts)
  }, [])

  useEffect(() => {
    const filtered = searchProducts(allProducts, query)
    setResults(filtered.slice(0, 20))
  }, [query, allProducts])

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>Search Products</Text>
      <TextInput
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#f8fafc',
          marginBottom: 16,
          fontSize: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
        placeholder="Type to search..."
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      {query === '' ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Start typing to search products...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>No results found for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i: Product) => i.id}
          renderItem={({ item }: { item: Product }) => {
            const highlights = highlightMatch(item.name, query)
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Product', { id: item.id })
                }}
                style={styles.card}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    {highlights.map((part, i) => (
                      <Text
                        key={i}
                        style={{
                          backgroundColor: part.highlight ? '#fef08a' : 'transparent',
                          fontWeight: part.highlight ? 'bold' : 'normal',
                        }}
                      >
                        {part.text}
                      </Text>
                    ))}
                  </Text>
                  <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

function GroupsScreen({ navigation }: any) {
  const { groups, createGroup, deleteGroup, setActiveGroup, activeGroup } = useGroups()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  const handleCreate = () => {
    if (name.trim()) {
      createGroup(name, desc)
      setName('')
      setDesc('')
      setShowCreate(false)
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={styles.h1}>My Groups</Text>
        <Button title="+ Create" onPress={() => setShowCreate(!showCreate)} />
      </View>

      {showCreate && (
        <View style={{ padding: 16, backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
          <TextInput
            style={{ padding: 12, backgroundColor: '#fff', borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' }}
            placeholder="Group name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={{ padding: 12, backgroundColor: '#fff', borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' }}
            placeholder="Description"
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={3}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Create" onPress={handleCreate} />
            <Button title="Cancel" onPress={() => setShowCreate(false)} color="#6b7280" />
          </View>
        </View>
      )}

      {groups.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>No groups yet. Create one to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.id}
          renderItem={({ item: group }) => (
            <View
              style={{
                padding: 16,
                backgroundColor: activeGroup?.id === group.id ? '#dbeafe' : '#f8fafc',
                borderRadius: 8,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: activeGroup?.id === group.id ? '#3b82f6' : '#e5e7eb',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{group.name}</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{group.description}</Text>
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>👥 {group.members.length}</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>🛒 {group.sharedCart.length}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button title="Details" onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })} />
                {activeGroup?.id === group.id ? (
                  <Button title="Deactivate" onPress={() => setActiveGroup(null)} color="#6b7280" />
                ) : (
                  <Button title="Set Active" onPress={() => setActiveGroup(group.id)} />
                )}
                <Button
                  title="Delete"
                  onPress={() => deleteGroup(group.id)}
                  color="#ef4444"
                />
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

function GroupDetailScreen({ route, navigation }: any) {
  const { groupId } = route.params
  const { groups, addMember, removeMember } = useGroups()
  const group = groups.find((g) => g.id === groupId)
  const [showAdd, setShowAdd] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [memberEmail, setMemberEmail] = useState('')

  if (!group) {
    return (
      <SafeAreaView style={styles.root}>
        <Text>Group not found</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    )
  }

  const handleAdd = () => {
    if (memberName.trim() && memberEmail.trim()) {
      addMember(group.id, {
        id: Math.random().toString(36).substring(2, 11),
        name: memberName,
        email: memberEmail,
        role: 'member',
      })
      setMemberName('')
      setMemberEmail('')
      setShowAdd(false)
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.h1}>{group.name}</Text>
      <Text style={{ color: '#6b7280', marginBottom: 20 }}>{group.description}</Text>

      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Members ({group.members.length})</Text>
          <Button title="+ Add" onPress={() => setShowAdd(!showAdd)} />
        </View>

        {showAdd && (
          <View style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
            <TextInput
              style={{ padding: 8, backgroundColor: '#fff', borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' }}
              placeholder="Name"
              value={memberName}
              onChangeText={setMemberName}
            />
            <TextInput
              style={{ padding: 8, backgroundColor: '#fff', borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' }}
              placeholder="Email"
              value={memberEmail}
              onChangeText={setMemberEmail}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Add" onPress={handleAdd} />
              <Button title="Cancel" onPress={() => setShowAdd(false)} color="#6b7280" />
            </View>
          </View>
        )}

        {group.members.map((member) => (
          <View key={member.id} style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontWeight: '600' }}>{member.name}</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{member.email}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Text
                  style={{
                    padding: 4,
                    backgroundColor: member.role === 'owner' ? '#3b82f6' : '#e5e7eb',
                    color: member.role === 'owner' ? 'white' : '#374151',
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  {member.role}
                </Text>
                {member.role !== 'owner' && (
                  <Button title="Remove" onPress={() => removeMember(group.id, member.id)} color="#ef4444" />
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      <View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Shared Cart ({group.sharedCart.length})
        </Text>
        {group.sharedCart.length === 0 ? (
          <Text style={{ color: '#6b7280', fontSize: 14 }}>No items in shared cart</Text>
        ) : (
          group.sharedCart.map((itemId) => (
            <View key={itemId} style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
              <Text>Item: {itemId}</Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  )
}

// Tab Navigator for main screens
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📂</Text>,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="WishlistTab"
        component={WishlistScreen}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>❤️</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  const storage = createInMemoryStorage()
  return (
    <AuthProvider>
      <CartProvider storage={storage as any}>
        <WishlistProvider storage={storage as any}>
          <GroupProvider storage={storage as any}>
            <OrderProvider storage={storage as any}>
              <NavigationContainer>
                <Stack.Navigator>
                  <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
                  <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal', headerShown: false }} />
                  <Stack.Screen name="Search" component={SearchScreen} />
                  <Stack.Screen name="Product" component={ProductScreen} />
                  <Stack.Screen name="Groups" component={GroupsScreen} />
                  <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
                  <Stack.Screen name="Orders" component={OrdersScreen} />
                  <Stack.Screen name="Checkout" component={CheckoutScreen} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </OrderProvider>
          </GroupProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#fff' },
  h1: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { padding: 12, borderRadius: 8, backgroundColor: '#f8fafc', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  price: { color: '#6b7280', marginTop: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#f8fafc', marginBottom: 8 },
  // New styles for better UI (Yours was ugly, not sorry)
  logo: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 20 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, paddingVertical: 12, backgroundColor: '#f9fafb', borderRadius: 12 },
  quickAction: { alignItems: 'center', position: 'relative' },
  quickActionIcon: { fontSize: 24, marginBottom: 4 },
  quickActionText: { fontSize: 12, color: '#6b7280' },
  badge: { position: 'absolute', top: -4, right: -12, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1f2937' },
  productGrid: { paddingBottom: 16 },
  productCard: { flex: 1, margin: 6, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  productImagePlaceholder: { aspectRatio: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '500', color: '#1f2937', marginBottom: 4, height: 36 },
  productPrice: { fontSize: 16, fontWeight: '700', color: '#4f46e5' },
})