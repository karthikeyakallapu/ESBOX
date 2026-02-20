import { Pencil } from "lucide-react";
import useModalStore from "../../store/useModal";
import { useEffect, useMemo, useState } from "react";
import type { RenameFileModalData } from "../../types/file";

const RenameFile = () => {
  const { closeModal, data } = useModalStore();

  const modalData = useMemo(() => {
    if (
      typeof data === "object" &&
      data !== null &&
      "file" in data &&
      "onRename" in data
    ) {
      return data as RenameFileModalData;
    }
    return null;
  }, [data]);

  const file = modalData?.file;
  const onRename = modalData?.onRename;

  const [name, setName] = useState(file?.filename ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setName(file.filename);
      setError(null);
    }
  }, [file]);

  if (!file || !onRename) {
    return null;
  }

  const trimmedName = name.trim();
  const isUnchanged = trimmedName === file.filename;
  const isInvalid = !trimmedName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isInvalid || isUnchanged) return;

    try {
      setLoading(true);
      setError(null);

      await onRename(trimmedName);
      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while renaming.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Pencil size={28} className="text-gray-400" />
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Rename Folder</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Current name: <span className="font-medium">{file.filename}</span>
          </p>
        </div>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && (
        <p className="text-xs text-red-600 mt-1" role="alert">
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
          type="submit"
          disabled={loading || isInvalid || isUnchanged}
          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
        >
          {loading ? "Renaming..." : "Rename"}
        </button>
      </div>
    </form>
  );
};

export default RenameFile;
