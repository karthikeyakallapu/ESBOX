import { EllipsisVertical } from "lucide-react";
import { mutate } from "swr";
import useOptionsDropdown from "../../hooks/useOptionsDropdown";
import Toast from "../../utils/Toast";
import type { FolderData } from "../../types/folder";
import TrashMenu from "./TrashMenu";
import apiService from "../../service/apiService";
import type { UserFile } from "../../types/file";
import FileCard from "../file/FileCard";

const TrashFileItem = ({ file }: { file: UserFile }) => {
  const { isMenuOpen, toggleMenu, menuRef, buttonRef, setIsMenuOpen } =
    useOptionsDropdown();

  const removeFromTrashList = async () => {
    await mutate(
      "user_trash",
      (current: FolderData | undefined) => {
        if (!current) return current;

        return {
          ...current,
          files: current.files.filter((f) => f.id !== file.id),
        };
      },
      { revalidate: false },
    );
  };

  const handleRestore = async () => {
    try {
      await apiService.updateUserTrash({
        item_id: file.id,
        item_type: "file",
        action: "restore",
      });

      await removeFromTrashList();

      Toast({
        type: "success",
        message: "File restored successfully",
      });
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to restore file",
      });
    }

    setIsMenuOpen(false);
  };

  const handlePermanentDelete = async () => {
    try {
      await apiService.updateUserTrash({
        item_id: file.id,
        item_type: "file",
        action: "delete",
      });

      await removeFromTrashList();

      Toast({
        type: "success",
        message: "File permanently deleted",
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
    <FileCard mime_type={file.mime_type} name={file.filename} isLoading={false}>
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
    </FileCard>
  );
};

export default TrashFileItem;
