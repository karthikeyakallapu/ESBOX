import axiosInstance from "./axiosHelper";
import type { UserRegister, UserLogin } from "../types/user";
import { ENDPOINTS } from "./endpoints";
import { handleApiError } from "./errorHandler";
import type { FolderUpdateData } from "../types/folder";
import type { FileUpdate } from "../types/file";

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

  getUserTrash = async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TRASH);
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  updateUserTrash = async ({
    item_id,
    item_type,
    action,
  }: {
    item_id: number | string;
    item_type: "file" | "folder";
    action: "restore" | "delete";
  }) => {
    try {
      if (action === "restore") {
        const response = await axiosInstance.patch(ENDPOINTS.TRASH, {
          item_id,
          item_type,
        });
        return response.data;
      } else if (action === "delete") {
        const response = await axiosInstance.delete(ENDPOINTS.TRASH, {
          data: {
            item_id,
            item_type,
          },
        });
        return response.data;
      }
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  // User APIs //

  // Folder APIs //

  getAllFilesAndFolders = async ({
    parentId,
    isStarred,
  }: {
    parentId: number | string | null;
    isStarred?: boolean;
  }) => {
    try {
      const parent_id = parentId !== null ? { parent_id: parentId } : {};
      const starred = isStarred ? { is_starred: true } : {};
      const params = { ...parent_id, ...starred };
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

  uploadFile = async (formData: FormData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.UPLOAD_FILE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  updateFile = async (fileId: number, data: FileUpdate) => {
    try {
      const response = await axiosInstance.patch(
        ENDPOINTS.UPDATE_FILE(fileId),
        data,
      );
      return response.data;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };

  renameFile = async (fileId: number, data: FileUpdate) => {
    try {
      const response = await axiosInstance.patch(
        ENDPOINTS.UPDATE_FILE(fileId),
        data,
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

  streamFile = async (file_id: number | string) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.STREAM_FILE(file_id), {
        responseType: "blob",
      });
      return response.data as Blob;
    } catch (error) {
      const err = handleApiError(error);
      throw new Error(err.message);
    }
  };
}

const apiService = new APIService();

export default apiService;
