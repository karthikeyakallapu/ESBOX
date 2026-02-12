import { Pencil, Trash2 } from "lucide-react";
 
interface Props {
  onRename: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  isRenaming: boolean;
}

const FolderMenu = ({ onRename, isRenaming, isDeleting, onDelete }: Props) => {
 
  const handleRename = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRename();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute top-12 left-36 z-50 min-w-45 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
    >
      <button
        onClick={handleRename}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
      >
        <Pencil className="h-4 w-4" />
        Rename
      </button>

      <button
        onClick={handleDelete}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </div>
  );
};

export default FolderMenu;
