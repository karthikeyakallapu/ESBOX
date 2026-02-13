const API_BASE_URL = "/api/v1";

export const ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  FILES_AND_FOLDERS: `${API_BASE_URL}/folders/getAll`,
  CREATE_FOLDER: `${API_BASE_URL}/folders/create`,
  DELETE_FOLDER: `${API_BASE_URL}/folders/delete`,
  RENAME_FOLDER: `${API_BASE_URL}/folders/rename`,
  UPLOAD_FILE: `${API_BASE_URL}/files/upload`,
  DELETE_FILE: `${API_BASE_URL}/files/delete`,
  RENAME_FILE: `${API_BASE_URL}/files/rename`,
};
