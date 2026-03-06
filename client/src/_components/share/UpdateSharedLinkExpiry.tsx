import { Clock, Save, Calendar } from "lucide-react";
import useModalStore from "../../store/useModal";
import { useEffect, useMemo, useState } from "react";
import type { UpdateSharedLinkExpiryModalData } from "../../types/share";
import apiService from "../../service/apiService";
import Toast from "../../utils/Toast";

const UpdateSharedLinkExpiry = () => {
  const { closeModal, data } = useModalStore();

  const modalData = useMemo(() => {
    if (
      typeof data === "object" &&
      data !== null &&
      "shareToken" in data &&
      "fileName" in data &&
      "currentExpiry" in data &&
      "onUpdate" in data
    ) {
      return data as UpdateSharedLinkExpiryModalData;
    }
    return null;
  }, [data]);

  const { shareToken, fileName, currentExpiry, onUpdate } = modalData || {};
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentExpiry) {
      // Format current expiry for date input (YYYY-MM-DD)
      const date = new Date(currentExpiry);
      const formatted = date.toISOString().split("T")[0];
      setExpiryDate(formatted);
    }
  }, [currentExpiry]);

  if (!shareToken || !fileName || !onUpdate) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expiryDate) {
      setError("Please select an expiry date");
      return;
    }

    const selectedDate = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Expiry date cannot be in the past");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate hours from now until selected date
      const hours = Math.ceil(
        (selectedDate.getTime() - Date.now()) / (1000 * 60 * 60),
      );

      await apiService.updateSharedLink(shareToken, {
        expire_in_hours: hours,
      });
      await onUpdate();

      Toast({
        type: "success",
        message: `Link expiration updated to ${selectedDate.toLocaleDateString()}`,
      });

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating expiry.",
      );
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-linear-to-br from-amber-50/50 via-white to-orange-50/50 rounded-2xl" />

      <form onSubmit={handleSubmit} className="relative space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-200 rounded-xl blur-md opacity-60" />
            <div className="relative w-14 h-14 bg-linear-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Update Expiration
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="truncate max-w-50 block">{fileName}</span>
            </p>
          </div>
        </div>

        {/* Current expiry */}
        {currentExpiry && (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800">Current:</span>
              <span className="font-medium text-amber-900">
                {new Date(currentExpiry).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Date picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select new expiry date
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            min={minDate}
            className="w-full px-4 py-3 bg-white border-2 border-gray-100 
                     rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100
                     transition-all duration-200 outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Link will expire at midnight on the selected date
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 
                     bg-gray-50 hover:bg-gray-100 rounded-xl
                     transition-all duration-200 inline-flex items-center gap-2
                     disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white
                     bg-linear-to-r from-amber-500 to-orange-500
                     hover:from-amber-600 hover:to-orange-600
                     rounded-xl transition-all duration-200
                     inline-flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Expiry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateSharedLinkExpiry;
