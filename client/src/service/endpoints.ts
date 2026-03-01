export const API_BASE_URL = "/api/v1";

export const ENDPOINTS = {
  // Auth APIs //
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
  RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,

  // User APIs //
  TRASH: `${API_BASE_URL}/trash`,

  // FILE & FOLDER APIs //
  FILES_AND_FOLDERS: `${API_BASE_URL}/folders`,
  UPDATE_FOLDER: (folder_id: number | string) =>
    `${API_BASE_URL}/folders/${folder_id}`,

  UPLOAD_FILE: `${API_BASE_URL}/upload/fast`,
  DELETE_FILE: `${API_BASE_URL}/telegram/delete`,
  RENAME_FILE: `${API_BASE_URL}/telegram/rename`,
  UPDATE_FILE: (file_id: number) => `${API_BASE_URL}/files/${file_id}`,

  // Telegram APIs //
  TELEGRAM_LINK: `${API_BASE_URL}/telegram/login`,
  TELEGRAM_VERIFY: `${API_BASE_URL}/telegram/verify`,

  // Stream APIs //
  STREAM_FILE: (file_id: number | string) =>
    `${API_BASE_URL}/files/${file_id}/view`,
};
