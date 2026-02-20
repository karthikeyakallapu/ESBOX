import useModalStore from "../../store/useModal";
import Toast from "../../utils/Toast";
import apiService from "../../service/apiService";
import { mutate } from "swr";
import type { UserFile } from "../../types/file";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { FolderData } from "../../types/folder";

const useFileActions = (file: UserFile, closeMenu?: () => void) => {
  const location = useLocation();

  //   Derive correct SWR key based on current route
  const currentKey = useMemo(() => {
    if (location.pathname.includes("/starred")) {
      return "starred_items";
    }

    if (location.pathname.includes("/trash")) {
      return "trash_items";
    }

    return file.parent_id
      ? `sub_folder_${file.parent_id}`
      : "files-and-folders";
  }, [location.pathname, file.parent_id]);

  //   Shared mutation helper
  const mutateFolderList = async (
    updater: (current: FolderData) => FolderData,
  ) => {
    await mutate(
      currentKey,
      (current: FolderData | undefined) => {
        if (!current) return current;
        return updater(current);
      },
      { revalidate: false },
    );
  };

  const handleDelete = async (file_id: string | number): Promise<void> => {
    try {
      const response = await apiService.deleteFile(file_id);
      // await mutate(getFileKey());
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

  const handleStar = async (file_id: number): Promise<void> => {
    try {
      const updatedFile = await apiService.updateFile(file_id, {
        action: file.is_starred ? "unstar" : "star",
      });

      await mutateFolderList((current) => {
        let updatedFiles = current.files.map((f) =>
          f.id === file_id ? { ...f, ...updatedFile } : f,
        );

        // If we're in starred Page and user unstars → remove item
        if (currentKey === "starred_items") {
          updatedFiles = updatedFiles.filter((f) => f.is_starred);
        }

        return {
          ...current,
          files: updatedFiles,
        };
      });

      Toast({
        type: "success",
        message: `File ${file.is_starred ? "removed from" : "added to"} starred`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "File update failed";
      Toast({
        type: "error",
        message: errorMessage,
      });
      throw error;
    }
  };

  async function handleRename(new_name: string) {
    try {
      const updatedFile = await apiService.updateFile(file.id, {
        action: "rename",
        payload: { new_name: new_name.trim() },
      });

      await mutateFolderList((current) => {
        if (!current) return current;
        const updatedFiles = current.files.map((f) =>
          f.id === file.id ? { ...f, ...updatedFile } : f,
        );
        return {
          ...current,
          files: updatedFiles,
        };
      });

      Toast({
        type: "success",
        message: "File renamed successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "File rename failed";
      Toast({
        type: "error",
        message: errorMessage,
      });
      throw error;
    }
  }

  const deleteFile = (fileId: string) => {
    closeMenu?.();
    console.log(`Deleting file with ID: ${fileId}`);
    const { openModal } = useModalStore.getState();
    openModal("deleteFile", { file, onDelete: handleDelete });
  };

  const renameFile = () => {
    closeMenu?.();
    console.log(`Renaming file with ID: ${file.id}`);
    const { openModal } = useModalStore.getState();
    openModal("renameFile", { file, onRename: handleRename });
  };

  return {
    deleteFile,
    handleStar,
    renameFile,
  };
};

export default useFileActions;
