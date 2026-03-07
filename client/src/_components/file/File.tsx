import FileCard from "./FileCard";
import type { UserFile } from "../../types/file";
import useOptionsDropdown from "../../hooks/useOptionsDropdown";
import { EllipsisVertical } from "lucide-react";
import useFileActions from "./fileActions";
import ItemMenu from "../menu/ItemMenu";

const File = ({ file }: { file: UserFile }) => {
  const {
    isMenuOpen,
    toggleMenu,
    isDeleting,
    setIsMenuOpen,
    isRenaming,
    menuRef,
    isSharing,
    buttonRef,
  } = useOptionsDropdown();

  const {
    deleteFile,
    handleStar,
    renameFile,
    shareFile,
    downloadFile,
    handleArchive,
  } = useFileActions(file, () => setIsMenuOpen(false));

  const handleStarClick = async () => {
    await handleStar(file.id);
    setIsMenuOpen(false);
  };

  const handleArchiveClick = async () => {
    await handleArchive(file.id);
    setIsMenuOpen(false);
  };

  return (
    <FileCard file={file} isLoading={false}>
      <h1></h1>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu(e);
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100"
      >
        <EllipsisVertical className="h-5 w-5" />
      </button>

      {isMenuOpen && (
        <div ref={menuRef}>
          <ItemMenu
            onDelete={() => deleteFile(file.id)}
            onRename={renameFile}
            isRenaming={isRenaming}
            shareFile={shareFile}
            isDeleting={isDeleting}
            updateStar={handleStarClick}
            onArchive={handleArchiveClick}
            isSharing={isSharing}
            isStarred={file.is_starred}
            isArchived={file.is_archived}
            downloadFile={() => downloadFile(file.id, file.name)}
          />
        </div>
      )}
    </FileCard>
  );
};

export default File;
