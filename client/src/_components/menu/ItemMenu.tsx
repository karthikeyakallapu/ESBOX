import { Pencil, Trash2, Star, Share2, Download } from "lucide-react";

interface Props {
  onRename: () => void;
  onDelete: () => void;
  updateStar: (is_starred: boolean) => void;
  isDeleting: boolean;
  isRenaming: boolean;
  isStarred: boolean;
  isSharing: boolean;
  shareFile: () => void;
  downloadFile: () => void;
}

const ItemMenu = ({
  onRename,
  isRenaming,
  isDeleting,
  onDelete,
  updateStar,
  isStarred,
  isSharing,
  shareFile,
  downloadFile,
}: Props) => {
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

  const handleUpdateStar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateStar(!isStarred);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    shareFile();
  };

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute top-12 left-36 z-50 min-w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
    >
      <button
        onClick={handleRename}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Pencil className="h-4 w-4 text-gray-500" />
        Rename
      </button>

      <button
        onClick={handleDelete}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
        Delete
      </button>

      <button
        onClick={handleUpdateStar}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50"
      >
        <Star
          className="h-4 w-4"
          fill={isStarred ? "currentColor" : "none"}
          color={isStarred ? "#d97706" : "#9ca3af"}
        />
        {isStarred ? "Remove from Starred" : "Add to Starred"}
      </button>

      <button
        onClick={handleShare}
        disabled={isSharing}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
      >
        <Share2 className="h-4 w-4 text-blue-500" />
        Share
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          downloadFile();
        }}
        disabled={isSharing}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
      >
        <Download className="h-4 w-4 text-green-500" />
        Download
      </button>
    </div>
  );
};

export default ItemMenu;
