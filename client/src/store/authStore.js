import { create } from "zustand";

const API_URL = "http://localhost:5000/api";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Google login
  googleLogin: async (credential) => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (data.success) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error: "Login failed" };
    }
  },

  // Fetch current user from cookie
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error("Logout error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
