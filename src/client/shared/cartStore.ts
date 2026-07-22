import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'PHYSICAL' | 'SERVICE';
  quantity: number;
  stock?: number;
  durationMin?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const current = get().items;
    const existing = current.find((i) => i.id === item.id);
    if (existing) {
      set({
        items: current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...current, { ...item, quantity: 1 }] });
    }
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  updateQuantity: (id, delta) => {
    const current = get().items;
    set({
      items: current
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    });
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
