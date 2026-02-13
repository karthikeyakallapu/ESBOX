import { Trash2 } from "lucide-react";
import useModalStore from "../../store/useModal";
import { useEffect, useMemo, useState } from "react";
import type { DeleteFileModalData } from "../../types/file";

const DeleteFile = () => {
  const { closeModal, data } = useModalStore();

  const modalData = useMemo(() => {
    if (
      typeof data === "object" &&
      data !== null &&
      "file" in data &&
      "onDelete" in data
    ) {
      return data as DeleteFileModalData;
    }
    return null;
  }, [data]);

  const file = modalData?.file;
  const onDelete = modalData?.onDelete;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error when folder changes
  useEffect(() => {
    setError(null);
  }, [file]);

  if (!file || !onDelete) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await onDelete(file.id);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete folder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
        <Trash2 size={28} className="text-red-500" />
        <div>
          <h3 className="text-sm font-semibold text-red-700">Delete Folder</h3>
          <p className="text-xs text-red-600 mt-0.5">
            Are you sure you want to delete{" "}
            <span className="font-medium">"{file.filename}"</span>?
          </p>
        </div>
      </div>

      {/* Warning */}
      <p className="text-xs text-gray-500">This action cannot be undone.</p>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={closeModal}
          disabled={loading}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 
                     rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default DeleteFile;
