import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

export const baseURL: string = import.meta.env.VITE_BACKEND_URL || "";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const url = originalRequest?.url ?? "";
    const skipAuthRefresh =
      typeof originalRequest?.headers?.get === "function"
        ? originalRequest.headers.get("x-skip-auth-refresh") === "true"
        : (originalRequest?.headers as Record<string, string> | undefined)?.[
            "x-skip-auth-refresh"
          ] === "true";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !skipAuthRefresh &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post("/api/v1/auth/refresh");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
