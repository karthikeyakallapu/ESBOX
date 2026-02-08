import { create } from "zustand";
import type { AuthStore } from "../types/auth";
import apiService from "../service/apiService";
import Toast from "../utils/Toast";

const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  hydrate: async () => {
    try {
      const user = await apiService.getCurrentUser();
      set({ isAuthenticated: true, user: user });
    } catch (error) {
      console.log(error);
      set({ isAuthenticated: false, user: null });
    }
  },
  logout: async () => {
    try {
      const response = await apiService.logoutUser();
      set({ isAuthenticated: false, user: null });
      Toast({
        type: "success",
        message: response.message,
      });
    } catch (error) {
      Toast({
        type: "error",
        message: error instanceof Error ? error.message : "Logout failed",
      });
      console.log("Logout failed:", error);
    }
  },
}));

export default useAuthStore;
