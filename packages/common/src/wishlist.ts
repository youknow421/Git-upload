export type WishlistState = {
  items: string[]; // Array of product slugs
};

export type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_WISHLIST'; payload: string[] };

export const initialWishlistState: WishlistState = {
  items: [],
};

export const wishlistReducer = (
  state: WishlistState,
  action: WishlistAction
): WishlistState => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      const slug = action.payload;
      if (state.items.includes(slug)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, slug],
      };
    }
    case 'REMOVE_FROM_WISHLIST': {
      return {
        ...state,
        items: state.items.filter((slug) => slug !== action.payload),
      };
    }
    case 'CLEAR_WISHLIST': {
      return {
        ...state,
        items: [],
      };
    }
    case 'SET_WISHLIST': {
      return {
        ...state,
        items: action.payload,
      };
    }
    default:
      return state;
  }
};
