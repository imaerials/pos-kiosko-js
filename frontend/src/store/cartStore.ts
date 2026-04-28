import { create } from 'zustand';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  cartId: string | null;
  setCartId: (id: string) => void;
  addItem: (product: Product) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

const TAX_RATE = 0.08;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartId: null,
  setCartId: (id) => set({ cartId: id }),
  addItem: (product) => {
    const existing = get().items.find((item) => item.product_id === product.id);
    if (existing) {
      set((state) => ({
        items: state.items.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      set((state) => ({
        items: [
          ...state.items,
          {
            id: `temp-${Date.now()}`,
            cart_id: state.cartId || '',
            product_id: product.id,
            quantity: 1,
            unit_price: Number(product.price),
            product_name: product.name,
            product_sku: product.sku,
          },
        ],
      }));
    }
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
  },
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },
  clearCart: () => set({ items: [] }),
  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  },
  getTax: () => {
    return get().getSubtotal() * TAX_RATE;
  },
  getTotal: () => {
    return get().getSubtotal() + get().getTax();
  },
}));
