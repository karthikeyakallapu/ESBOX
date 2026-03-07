import {
  Pencil,
  Trash2,
  Star,
  Share2,
  Download,
  Archive,
  ArchiveRestore,
} from "lucide-react";

interface Props {
  onRename: () => void;
  onDelete: () => void;
  onArchive: () => void;
  updateStar: (is_starred: boolean) => void;
  isDeleting: boolean;
  isRenaming: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isSharing: boolean;
  shareFile: () => void;
  downloadFile: () => void;
}

const ItemMenu = ({
  onRename,
  isRenaming,
  isDeleting,
  onDelete,
  onArchive,
  isArchived,
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

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onArchive();
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
      className="absolute top-12 left-36 z-50 min-w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 backdrop-blur-sm"
    >
      {/* Rename */}
      <button
        onClick={handleRename}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <Pencil className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        Rename
      </button>

      {/* Archive/Unarchive */}
      <button
        onClick={handleArchive}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {isArchived ? (
          <>
            <ArchiveRestore className="h-4 w-4 text-gray-400" />
            Unarchive
          </>
        ) : (
          <>
            <Archive className="h-4 w-4 text-gray-400" />
            Archive
          </>
        )}
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-4 w-4 text-red-400" />
        Delete
      </button>

      <div className="border-t border-gray-100 my-1" />

      {/* Star */}
      <button
        onClick={handleUpdateStar}
        disabled={isDeleting || isRenaming}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
      >
        <Star
          className="h-4 w-4"
          fill={isStarred ? "currentColor" : "none"}
          color={isStarred ? "#d97706" : "#9ca3af"}
        />
        {isStarred ? "Remove from Starred" : "Add to Starred"}
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <Share2 className="h-4 w-4 text-gray-400" />
        Share
      </button>

      {/* Download */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          downloadFile();
        }}
        disabled={isSharing}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
      >
        <Download className="h-4 w-4 text-gray-400" />
        Download
      </button>
    </div>
  );
};

export default ItemMenu;
