import axiosInstance from "./axiosHelper";
import type { UserRegister, UserLogin } from "../types/user";
import { ENDPOINTS } from "./endpoints";
import { handleApiError } from "./errorHandler";

class APIService {
  registerUser = async (user: UserRegister) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.REGISTER, user);
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  loginUser = async (user: UserLogin) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.LOGIN, user);
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  logoutUser = async () => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.LOGOUT);
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };
}

const apiService = new APIService();

export default apiService;
