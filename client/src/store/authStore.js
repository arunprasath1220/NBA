import { create } from "zustand";

const API_URL = "http://localhost:5000/api";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Check if user has a specific role
  hasRole: (role) => {
    const { user } = get();
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  },

  // Check if user is admin
  isAdmin: () => {
    const { user } = get();
    if (!user || !user.roles) return false;
    return user.roles.includes("admin");
  },

  // Check if user has any of the specified roles
  hasAnyRole: (...roles) => {
    const { user } = get();
    if (!user || !user.roles) return false;
    return roles.some((role) => user.roles.includes(role));
  },

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
