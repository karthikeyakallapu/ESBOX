import { useMemo, useState } from "react";
import useForm from "../../hooks/useForm";
import apiService from "../../service/apiService";
import Toast from "../../utils/Toast";
import useModalStore from "../../store/useModal";
import type { ShareFileModalData } from "../../types/file";
import { LogoImage } from "../navigation/Logo";

const ShareFile = () => {
  const { closeModal, data: modalStoreData } = useModalStore();
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const modalData = useMemo(() => {
    if (
      typeof modalStoreData === "object" &&
      modalStoreData !== null &&
      "file" in modalStoreData &&
      "onShare" in modalStoreData
    ) {
      return modalStoreData as ShareFileModalData;
    }
    return null;
  }, [modalStoreData]);

  const {
    data: shareData,
    handleChange,
    submitForm,
    loading,
  } = useForm(
    {
      password: "",
    },
    (formData) =>
      apiService.shareFile({
        file_id: Number(modalData?.file?.id || 0),
        password: formData.password,
        expire_in_hours: 168,
      }),
  );

  const handleCreateLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await submitForm();
      setShareLink(response.shareable_link);
      Toast({
        type: "success",
        message: "Share link created successfully!",
      });
    } catch (error) {
      Toast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create share link",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      Toast({
        type: "success",
        message: "Link copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Toast({
        type: "error",
        message: error instanceof Error ? error.message : "Error copying link",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!modalData?.file) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">No file selected</p>
        </div>
      </div>
    );
  }

  const file = modalData.file;

  return (
    <div className="p-6">
      {/* Header with Logo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LogoImage
            innerHeight={5}
            innerWidth={5}
            outerHeight={10}
            outerWidth={10}
          />{" "}
          <h2 className="text-xl font-semibold text-gray-900">Share File</h2>
        </div>
      </div>

      {/* File Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          {/* File Icon */}
          <div className="shrink-0">
            {file.mime_type?.startsWith("image/") ? (
              <svg
                className="h-8 w-8 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </h3>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>Size: {formatFileSize(file.size)}</span>
              <span>Type: {file.mime_type || "Unknown"}</span>
              <span>Uploaded: {formatDate(file.uploaded_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Link Section */}
      {!shareLink ? (
        <form onSubmit={handleCreateLink} className="space-y-4">
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Set password for access
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={shareData?.password || ""}
              onChange={handleChange}
              required
              minLength={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter a password"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 4 characters - Link expires in 7 days
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Generate Share Link"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Success Message */}
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm font-medium text-green-800">
              Share link created!
            </p>
          </div>

          {/* Shareable Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shareable link (expires in 7 days)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={closeModal}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareFile;
