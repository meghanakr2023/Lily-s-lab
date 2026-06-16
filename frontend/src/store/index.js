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