import FileCard from "./FileCard";
import type { UserFile } from "../../types/file";
import useOptionsDropdown from "../../hooks/useOptionsDropdown";
import { EllipsisVertical } from "lucide-react";
import FileMenu from "./FileMenu";
import fileActions from "./fileActions";

const File = ({ file }: { file: UserFile }) => {
  const {
    isMenuOpen,
    toggleMenu,
    isDeleting,
    setIsMenuOpen,
    menuRef,
    buttonRef,
  } = useOptionsDropdown();

  const { deleteFile } = fileActions(file, () => setIsMenuOpen(false));

  return (
    <FileCard mime_type={file.mime_type} name={file.filename} isLoading={false}>
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
          <FileMenu
            deleteFile={() => deleteFile(file.id.toString())}
            isDeleting={isDeleting}
          />
        </div>
      )}
    </FileCard>
  );
};

export default File;
