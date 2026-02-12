// components/Folder/Folder.tsx

import { Link } from "react-router-dom";
import { EllipsisVertical } from "lucide-react";
import type { UserFolder } from "../../types/folder";
import useOptionsDropdown from "../../hooks/useOptionsDropdown";
import useFolderActions from "./folderActions";
import FolderCard from "./FolderCard";
import FolderMenu from "./FolderMenu";

const Folder = ({ folder }: { folder: UserFolder }) => {
  const { isMenuOpen, toggleMenu, isDeleting, isRenaming, menuRef, buttonRef, setIsMenuOpen } =
    useOptionsDropdown();

  const { deleteFolder, renameFolder } = useFolderActions(folder, () => setIsMenuOpen(false));

  const isLoading = isDeleting || isRenaming;

  return (
    <FolderCard name={folder.name} isLoading={isLoading}>
      <Link to={`/folders/${folder.id}`} className="absolute inset-0" />

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
          <FolderMenu
            onDelete={deleteFolder}
            onRename={renameFolder}
            isDeleting={isDeleting}
            isRenaming={isRenaming}
          />
        </div>
      )}
    </FolderCard>
  );
};

export default Folder;
