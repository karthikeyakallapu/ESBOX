const API_BASE_URL = "/api/v1";

export const ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  TRASH: `${API_BASE_URL}/trash`,
  ME: `${API_BASE_URL}/auth/me`,
  FILES_AND_FOLDERS: `${API_BASE_URL}/folders`,
  CREATE_FOLDER: `${API_BASE_URL}/folders`,
  UPDATE_FOLDER: (folder_id: number | string) =>
    `${API_BASE_URL}/folders/${folder_id}`,
  UPLOAD_FILE: `${API_BASE_URL}/telegram/upload`,
  DELETE_FILE: `${API_BASE_URL}/telegram/delete`,
  RENAME_FILE: `${API_BASE_URL}/telegram/rename`,
  TELEGRAM_LINK: `${API_BASE_URL}/telegram/login`,
  TELEGRAM_VERIFY: `${API_BASE_URL}/telegram/verify`,
};
