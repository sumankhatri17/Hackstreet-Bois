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
      const errorMessage =
        error.response?.data?.detail || error.message || "Login failed";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({ loading: false });
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || error.message || "Registration failed";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    set({ user: userData });
    localStorage.setItem("user", JSON.stringify(userData));
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
