import { Trash2 } from "lucide-react";
import useModalStore from "../../store/useModal";
import { useMemo, useState } from "react";
import type { DeleteSharedLinkModalData } from "../../types/share";
import apiService from "../../service/apiService";

const DeleteSharedLink = () => {
  const { closeModal, data } = useModalStore();

  const modalData = useMemo(() => {
    if (
      typeof data === "object" &&
      data !== null &&
      "shareToken" in data &&
      "fileName" in data &&
      "onDelete" in data
    ) {
      return data as DeleteSharedLinkModalData;
    }
    return null;
  }, [data]);

  const { shareToken, fileName, onDelete } = modalData || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!shareToken || !fileName || !onDelete) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      await apiService.deleteSharedLink(shareToken);
      await onDelete();
      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
        <Trash2 size={28} className="text-red-500" />
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Delete Shared Link
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            File: <span className="font-medium">{fileName}</span>
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Are you sure you want to delete this shared link? Anyone with the link
        will no longer be able to access the file.
      </p>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={closeModal}
          disabled={loading}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          {loading ? "Deleting..." : "Delete Link"}
        </button>
      </div>
    </div>
  );
};

export default DeleteSharedLink;
