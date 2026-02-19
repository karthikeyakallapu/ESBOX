import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { mutate } from "swr";
import Toast from "../../utils/Toast";
import apiService from "../../service/apiService";
import useModalStore from "../../store/useModal";
import type { UserFolder, FolderData } from "../../types/folder";

const useFolderActions = (folder: UserFolder, closeMenu?: () => void) => {
  const location = useLocation();

  //   Derive correct SWR key based on current route
  const currentKey = useMemo(() => {
    if (location.pathname.includes("/starred")) {
      return "starred_items";
    }

    if (location.pathname.includes("/trash")) {
      return "trash_items";
    }

    return folder.parent_id
      ? `sub_folder_${folder.parent_id}`
      : "files-and-folders";
  }, [location.pathname, folder.parent_id]);

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

  // =========================
  // DELETE
  // =========================
  const handleDelete = async () => {
    try {
      const deletedFolder = await apiService.deleteFolder(folder.id);

      await mutateFolderList((current) => ({
        ...current,
        folders: current.folders.filter((f) => f.id !== deletedFolder.id),
      }));

      Toast({
        type: "success",
        message: "Folder deleted successfully",
      });
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Folder delete failed",
      });
      throw error;
    }
  };

  // =========================
  // RENAME
  // =========================
  const handleRename = async (newName: string) => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      throw new Error("Folder name cannot be empty");
    }

    if (trimmedName === folder.name) return;

    try {
      const updatedFolder = await apiService.updateFolder(folder.id, {
        name: trimmedName,
      });

      await mutateFolderList((current) => ({
        ...current,
        folders: current.folders.map((f) =>
          f.id === folder.id ? { ...f, ...updatedFolder } : f,
        ),
      }));

      Toast({
        type: "success",
        message: "Folder renamed successfully",
      });
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Folder rename failed",
      });
      throw error;
    }
  };

  // =========================
  // STAR / UNSTAR
  // =========================
  const updateStar = async (is_starred: boolean) => {
    try {
      const updatedFolder = await apiService.updateFolder(folder.id, {
        is_starred,
      });

      await mutateFolderList((current) => {
        let updatedFolders = current.folders.map((f) =>
          f.id === folder.id ? { ...f, ...updatedFolder } : f,
        );

        // If we're in starred view and user unstars → remove item
        if (currentKey === "starred_items") {
          updatedFolders = updatedFolders.filter((f) => f.is_starred);
        }

        return {
          ...current,
          folders: updatedFolders,
        };
      });

      Toast({
        type: "success",
        message: `Folder ${
          is_starred ? "added to" : "removed from"
        } starred successfully`,
      });
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update starred status",
      });
      throw error;
    }

    closeMenu?.();
  };

  // =========================
  // MODAL TRIGGERS
  // =========================
  const renameFolder = () => {
    closeMenu?.();
    const { openModal } = useModalStore.getState();
    openModal("renameFolder", {
      folder,
      onRename: handleRename,
    });
  };

  const deleteFolder = () => {
    closeMenu?.();
    const { openModal } = useModalStore.getState();
    openModal("deleteFolder", {
      folder,
      onDelete: handleDelete,
    });
  };

  return {
    deleteFolder,
    renameFolder,
    updateStar,
  };
};

export default useFolderActions;
