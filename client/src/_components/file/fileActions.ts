import useModalStore from "../../store/useModal";
import Toast from "../../utils/Toast";
import apiService from "../../service/apiService";
import { mutate } from "swr";
import type { UserFile } from "../../types/file";

const fileActions = (file: UserFile, closeMenu?: () => void) => {
  const handleDelete = async (file_id: string | number): Promise<void> => {
    try {
      const response = await apiService.deleteFile(file_id);
      await mutate("files-and-folders");
      Toast({
        type: "success",
        message: response.message,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "File delete failed";
      Toast({
        type: "error",
        message: errorMessage,
      });
      throw error;
    }
  };

  const deleteFile = (fileId: string) => {
    closeMenu?.();
    console.log(`Deleting file with ID: ${fileId}`);
    const { openModal } = useModalStore.getState();
    openModal("deleteFile", { file, onDelete: handleDelete });
  };

  return {
    deleteFile,
  };
};

export default fileActions;
