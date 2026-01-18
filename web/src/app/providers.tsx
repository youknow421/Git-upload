'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { GroupProvider } from '@/context/GroupContext'
import { OrderProvider } from '@/context/OrderContext'
import { NotificationProvider } from '@/context/NotificationContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <WishlistProvider>
            <GroupProvider>
              <OrderProvider>
                {children}
              </OrderProvider>
            </GroupProvider>
          </WishlistProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
