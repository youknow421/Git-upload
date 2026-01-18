import { Product } from './types';

export type CartItem = { product: Product; qty: number };

export type CartState = { items: CartItem[] };

export const initialCart: CartState = { items: [] };

export type CartAction =
  | { type: 'ADD'; product: Product; qty?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'SET_QTY'; productId: string; qty: number }
  | { type: 'CLEAR' };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const idx = state.items.findIndex((i) => i.product.id === action.product.id);
      if (idx >= 0) {
        const items = state.items.slice();
        items[idx] = { ...items[idx], qty: items[idx].qty + (action.qty ?? 1) };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, { product: action.product, qty: action.qty ?? 1 }] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
    case 'SET_QTY':
      return { ...state, items: state.items.map((i) => (i.product.id === action.productId ? { ...i, qty: action.qty } : i)) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}
