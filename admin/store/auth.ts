'use client';

import { create } from 'zustand';

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AdminAuthState {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => void;
}

// Simple store - no SSR persist, read from localStorage manually
export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  // Call this on client mount to hydrate from localStorage
  init: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('admin-auth-store');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken && parsed?.user) {
          set({
            user: parsed.user,
            accessToken: parsed.accessToken,
            isAuthenticated: true,
          });
          localStorage.setItem('admin_access_token', parsed.accessToken);
        }
      }
    } catch { /* ignore */ }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // Dynamic import to avoid SSR issues
      const axios = (await import('axios')).default;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { accessToken, user } = data.data;

      if (!['admin', 'super_admin'].includes(user.role)) {
        throw new Error('دسترسی غیرمجاز. فقط مدیران می‌توانند وارد شوند.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_access_token', accessToken);
        localStorage.setItem('admin-auth-store', JSON.stringify({ accessToken, user }));
      }

      set({ user, accessToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin-auth-store');
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
