'use client';

import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  init: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const getApiBase = () => {
  if (typeof window !== 'undefined') return window.location.origin + '/api';
  return 'http://localhost:3000/api';
};

async function callApi(path: string, method: string, body?: object, token?: string) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'خطا در درخواست');
  return json;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  init: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('auth-store');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken) {
          localStorage.setItem('access_token', parsed.accessToken);
          if (parsed.refreshToken) localStorage.setItem('refresh_token', parsed.refreshToken);
          set({ user: parsed.user, accessToken: parsed.accessToken, refreshToken: parsed.refreshToken, isAuthenticated: true });
        }
      }
    } catch { /* ignore */ }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const json = await callApi('/auth/login', 'POST', { email, password });
      const { accessToken, refreshToken, user } = json.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('auth-store', JSON.stringify({ accessToken, refreshToken, user }));
      }
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (registerData) => {
    set({ isLoading: true });
    try {
      const json = await callApi('/auth/register', 'POST', registerData);
      const { accessToken, refreshToken, user } = json.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('auth-store', JSON.stringify({ accessToken, refreshToken, user }));
      }
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) await callApi('/auth/logout', 'POST', undefined, token);
    } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-store');
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));
