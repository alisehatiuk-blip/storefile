'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

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
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { accessToken, user } = data.data;

          if (!['admin', 'super_admin'].includes(user.role)) {
            throw new Error('دسترسی غیرمجاز. فقط مدیران می‌توانند وارد شوند.');
          }

          localStorage.setItem('admin_access_token', accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('admin_access_token');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);
