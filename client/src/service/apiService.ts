import axiosInstance from "./axiosHelper";
import type { UserRegister, UserLogin } from "../types/user";
import { ENDPOINTS } from "./endpoints";
import { handleApiError } from "./errorHandler";
import type { AxiosProgressEvent } from "axios";
import type { FolderUpdateData } from "../types/folder";

class APIService {
  // User APIs //
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

  // User APIs //

  // Folder APIs //

  getAllFilesAndFolders = async (parentId: number | string | null) => {
    try {
      const params = parentId !== null ? { parent_id: parentId } : {};
      const response = await axiosInstance.get(ENDPOINTS.FILES_AND_FOLDERS, {
        params,
      });
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  createFolder = async ({
    folder_name,
    parent_id,
  }: {
    folder_name: string;
    parent_id: number | string | null;
  }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.CREATE_FOLDER, {
        name: folder_name,
        parent_id: parent_id,
      });
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  deleteFolder = async (folderId: number | string) => {
    try {
      const response = await axiosInstance.delete(
        ENDPOINTS.UPDATE_FOLDER(folderId),
        {
          params: { parent_id: folderId },
        },
      );
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  updateFolder = async (id: number, data: FolderUpdateData) => {
    try {
      const response = await axiosInstance.patch(
        ENDPOINTS.UPDATE_FOLDER(id),
        data,
      );
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  // Folder APIs //

  // File APIs //

  deleteFile = async (fileId: number | string) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.DELETE_FILE, {
        params: { file_id: fileId },
      });
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  uploadFile = async (
    formData: FormData,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  ) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.UPLOAD_FILE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress,
        },
      );
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  // File APIs //

  sendTelegramCode = async ({ phone }: { phone: string }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.TELEGRAM_LINK, {
        phone,
      });
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  verifyTelegramCode = async ({ code }: { code: string }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.TELEGRAM_VERIFY, {
        code,
      });
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };
}

const apiService = new APIService();

export default apiService;
