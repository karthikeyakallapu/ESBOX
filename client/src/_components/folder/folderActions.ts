import type { UserFolder } from "../../types/folder";
import Toast from "../../utils/Toast";
import apiService from "../../service/apiService";
import { mutate } from "swr";
import useModalStore from "../../store/useModal";
import type { FolderData } from "../../types/folder";

const folderActions = (folder: UserFolder, closeMenu?: () => void) => {
  const getFolderKey = () =>
    folder.parent_id ? `sub_folder_${folder.parent_id}` : "files-and-folders";

  const handleDelete = async (folder_id: string | number): Promise<void> => {
    try {
      const deletedFolder = await apiService.deleteFolder(folder_id);

      await mutate(
        getFolderKey(),
        (current: FolderData | undefined) => {
          if (!current) return current;
          return {
            ...current,
            folders: current.folders.filter((f) => f.id !== deletedFolder.id),
          };
        },
        { revalidate: false },
      );

      Toast({
        type: "success",
        message: "Folder deleted successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Folder delete failed";
      Toast({
        type: "error",
        message: errorMessage,
      });
      throw error;
    }
  };

  const handleRename = async (newName: string): Promise<void> => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      throw new Error("Folder name cannot be empty");
    }

    if (trimmedName === folder.name) {
      return; // No change needed
    }

    try {
      const updatedFolder = await apiService.updateFolder(folder.id, {
        name: trimmedName,
      });

      await mutate(
        getFolderKey(),
        (current: FolderData | undefined) => {
          if (!current) return current;
          return {
            ...current,
            folders: current.folders.map((f) =>
              f.id === folder.id ? { ...f, ...updatedFolder } : f,
            ),
          };
        },
        { revalidate: false },
      );

      Toast({
        type: "success",
        message: "Folder renamed successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Folder rename failed";
      Toast({
        type: "error",
        message: errorMessage,
      });
      throw error;
    }
  };

  const renameFolder = () => {
    if (!folder?.id || !folder?.name) {
      Toast({ type: "error", message: "Invalid folder data" });
      return;
    }
    closeMenu?.();
    const { openModal } = useModalStore.getState();
    openModal("renameFolder", { folder, onRename: handleRename });
  };

  const deleteFolder = () => {
    if (!folder?.id) {
      Toast({ type: "error", message: "Invalid folder data" });
      return;
    }
    closeMenu?.();
    const { openModal } = useModalStore.getState();
    openModal("deleteFolder", { folder, onDelete: handleDelete });
  };

  return { deleteFolder, renameFolder };
};

export default folderActions;
