import { useParams } from "react-router-dom";
import { useState } from "react";
import apiService from "../service/apiService";
import type { UserFile } from "../types/file";
import useModalStore from "../store/useModal";

const SharedFile = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [fileMeta, setFileMeta] = useState<UserFile>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { openModal } = useModalStore();

  const verifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await apiService.verifySharedFilePassword({
        token: token!,
        password,
      });
      setFileMeta(data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      setError(err.message || "Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (file: UserFile) => {
    if (file.mime_type?.startsWith("image/")) {
      openModal("streamImage", { ...file, token });
    } else if (file.mime_type?.startsWith("application/pdf")) {
      openModal("streamPDF", { ...file, token });
    } else if (file.mime_type?.startsWith("video/")) {
      openModal("streamVideo", { ...file, token });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  /* ---------------- PASSWORD SCREEN ---------------- */
  if (!fileMeta) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Protected File
            </h1>
            <p className="text-gray-500 text-sm">
              Enter the password to access this file
            </p>
          </div>

          <form onSubmit={verifyPassword} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Please wait..." : "Access File"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ---------------- FILE VIEWER ---------------- */
  return (
    <div className="h-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with file icon */}
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              {fileMeta.mime_type?.startsWith("video/") ? (
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : fileMeta.mime_type?.startsWith("image/") ? (
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {fileMeta.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {formatFileSize(fileMeta.size)}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {fileMeta.mime_type?.split("/").pop()?.toUpperCase() ||
                    "FILE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50/50">
          <button
            onClick={() => handleOpen(fileMeta)}
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>Preview File</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedFile;
