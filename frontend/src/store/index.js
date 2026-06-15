import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===================== AUTH STORE =====================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        localStorage.setItem('ll_token', token);
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('ll_token');
        localStorage.removeItem('ll_user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
      
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'll_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ===================== CART STORE =====================
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(item => item._id === product._id);
          if (existing) {
            return {
              items: state.items.map(item =>
                item._id === product._id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                  : item
              )
            };
          }
          return { items: [...state.items, { ...product, quantity }] };
        });
      },
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item._id !== productId)
      })),
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map(item =>
            item._id === productId ? { ...item, quantity } : item
          )
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      
      getSubtotal: () => get().items.reduce((sum, item) => {
        const price = item.discountPrice || item.price;
        return sum + price * item.quantity;
      }, 0),
      
      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 999 ? 0 : 99;
      },
      
      getTotal: () => get().getSubtotal() + get().getShipping(),
    }),
    {
      name: 'll_cart',
    }
  )
);

// ===================== WISHLIST STORE =====================
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => ({
          items: [...state.items.filter(p => p._id !== product._id), product]
        }));
      },
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(p => p._id !== productId)
      })),
      
      isInWishlist: (productId) => get().items.some(p => p._id === productId),
      
      clear: () => set({ items: [] }),
    }),
    { name: 'll_wishlist' }
  )
);