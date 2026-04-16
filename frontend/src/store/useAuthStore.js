import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Handle 2FA requirement
      if (data.requires2FA) {
        return { requires2FA: true, message: data.message };
      }

      // Server sets httpOnly cookies; keep localStorage for legacy admin compat
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      set({ user: data.user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  verify2FA: async (totpToken, email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, totpToken });
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      set({ user: data.user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Invalid 2FA code' };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    }
  },

  register: async (firstName, lastName, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { firstName, lastName, email, password });
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      set({ user: data.user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      const resp = error.response?.data;
      if (resp?.details) {
        return { success: false, error: resp.details.map(d => d.msg).join('. ') };
      }
      return { success: false, error: resp?.error || 'Registration failed' };
    }
  },

  checkAuth: async () => {
    try {
      // Cookie-based auth: just call /me and let the httpOnly cookie authenticate
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
