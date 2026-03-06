import { Key, Save, X } from "lucide-react";
import useModalStore from "../../store/useModal";
import { useMemo, useState } from "react";
import type { ChangeSharedLinkPasswordModalData } from "../../types/share";
import apiService from "../../service/apiService";
import Toast from "../../utils/Toast";

const ChangeSharedLinkPassword = () => {
  const { closeModal, data } = useModalStore();

  const modalData = useMemo(() => {
    if (
      typeof data === "object" &&
      data !== null &&
      "shareToken" in data &&
      "fileName" in data &&
      "onChangePassword" in data
    ) {
      return data as ChangeSharedLinkPasswordModalData;
    }
    return null;
  }, [data]);

  const { shareToken, fileName, onChangePassword } = modalData || {};
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!shareToken || !fileName || !onChangePassword) {
    return null;
  }

  const trimmedPassword = password.trim();
  const isInvalid = !trimmedPassword || trimmedPassword.length < 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isInvalid) return;

    try {
      setLoading(true);
      setError(null);

      await apiService.updateSharedLink(shareToken, {
        password: trimmedPassword,
      });
      await onChangePassword();
      closeModal();
      Toast({
        type: "success",
        message: "Password updated successfully",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while changing password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
        <Key size={28} className="text-indigo-500" />
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Change Password
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            File: <span className="font-medium">{fileName}</span>
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter new password"
          autoFocus
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 4 characters</p>
      </div>

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
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg inline-flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || isInvalid}
          className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 inline-flex items-center gap-1"
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Password"}
        </button>
      </div>
    </form>
  );
};

export default ChangeSharedLinkPassword;
