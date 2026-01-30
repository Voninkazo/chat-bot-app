import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL;

const userStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include' // Important! Sends cookies
      });
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        credentials: 'include' // Important! Sends cookies
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const userData = await response.json();
      set({ user: userData, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Handle OAuth callback - check if we're returning from Google OAuth
  handleOAuthCallback: async () => {
    const isOAuthCallback = window.location.pathname === '/auth/callback';

    if (isOAuthCallback) {
      // We're returning from Google OAuth
      // Cookie is already set by backend, just fetch user data
      set({ isLoading: true });

      // Clean up URL
      window.history.replaceState({}, document.title, '/');

      // Fetch user profile (cookie will be sent automatically)
      await get().initializeAuth();
      return true;
    }

    return false;
  }
}));

export default userStore;