import { create } from "zustand";
import authService from "../services/auth.service";

const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({ user: response.user, isAuthenticated: true, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
