import { EllipsisVertical } from "lucide-react";
import { mutate } from "swr";
import FolderCard from "../folder/FolderCard";
import useOptionsDropdown from "../../hooks/useOptionsDropdown";
import Toast from "../../utils/Toast";
import type { UserFolder, FolderData } from "../../types/folder";
import TrashMenu from "./TrashMenu";
import apiService from "../../service/apiService";

const TrashFolderItem = ({ folder }: { folder: UserFolder }) => {
  const { isMenuOpen, toggleMenu, menuRef, buttonRef, setIsMenuOpen } =
    useOptionsDropdown();

  const removeFromTrashList = async () => {
    await mutate(
      "user_trash",
      (current: FolderData | undefined) => {
        if (!current) return current;

        return {
          ...current,
          folders: current.folders.filter((f) => f.id !== folder.id),
        };
      },
      { revalidate: false },
    );
  };

  const handleRestore = async () => {
    try {
      await apiService.updateUserTrash({
        item_id: folder.id,
        item_type: "folder",
        action: "restore",
      });
      await removeFromTrashList();

      Toast({
        type: "success",
        message: "Folder restored successfully",
      });
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to restore folder",
      });
    }

    setIsMenuOpen(false);
  };

  const handlePermanentDelete = async () => {
    try {
      await apiService.updateUserTrash({
        item_id: folder.id,
        item_type: "folder",
        action: "delete",
      });

      await removeFromTrashList();

      Toast({
        type: "success",
        message: "Folder permanently deleted",
      });
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Permanent delete failed",
      });
    }

    setIsMenuOpen(false);
  };

  return (
    <FolderCard name={folder.name} isLoading={false}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100"
      >
        <EllipsisVertical className="h-5 w-5" />
      </button>

      {isMenuOpen && (
        <div ref={menuRef}>
          <TrashMenu
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        </div>
      )}
    </FolderCard>
  );
};

export default TrashFolderItem;
