import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  oauth_provider?: string;
  created_at: string;
  updated_at: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  handleOAuthCallback: () => Promise<boolean>;
}

const userStore = create<UserStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error("Logout error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Not authenticated");
      const userData: User = await response.json();
      set({ user: userData, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  handleOAuthCallback: async () => {
    const isOAuthCallback = window.location.pathname === "/auth/callback";
    if (isOAuthCallback) {
      set({ isLoading: true });
      window.history.replaceState({}, document.title, "/");
      await get().initializeAuth();
      return true;
    }
    return false;
  },
}));

export default userStore;
