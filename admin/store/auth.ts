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

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  init: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('admin-auth-store');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken && parsed?.user) {
          localStorage.setItem('admin_access_token', parsed.accessToken);
          set({ user: parsed.user, accessToken: parsed.accessToken, isAuthenticated: true });
        }
      }
    } catch { /* ignore */ }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // Use fetch directly to /api proxy (avoids cloudflare tunnel interstitial)
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'خطا در ورود' }));
        throw new Error(err.message || 'خطا در ورود');
      }

      const json = await res.json();

      if (!json.success) throw new Error(json.message || 'خطا در ورود');

      const { accessToken, user } = json.data;

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
