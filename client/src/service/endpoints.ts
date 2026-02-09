const API_BASE_URL = "/api/v1";

export const ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  FILES_AND_FOLDERS: `${API_BASE_URL}/folders/getAll`,
};
