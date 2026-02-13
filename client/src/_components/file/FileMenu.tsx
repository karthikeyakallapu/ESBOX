import { Trash2 } from "lucide-react";

interface Props {
  deleteFile: () => void;
  isDeleting: boolean;
}

const FileMenu = ({ deleteFile, isDeleting }: Props) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    deleteFile();
    // Implement delete logic here
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
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </div>
  );
};

export default FileMenu;
