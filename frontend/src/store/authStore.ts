import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  rating: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUserFromToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authAPI.register(email, username, password);
      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  loadUserFromToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const data = await authAPI.getProfile();
      set({
        user: data.user,
        isAuthenticated: true,
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
