import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { formatFileSize } from "../../../utils/common";
import useFileUpload from "../../../hooks/useFileUpload";
import useFolderNavStore from "../../../store/useFolderNav";
import { handleOverflowText } from "../../../utils/common";

const UploadFile = () => {
  const {
    dragActive,
    selectedFile,
    uploadStatus,
    uploadStage,
    progress,
 
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleRemove,
    handleUpload,
  } = useFileUpload({
    parent_id: useFolderNavStore.getState().getCurrentFolderId(),
  });

  const isUploading = uploadStatus === "uploading";

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">
        Upload A File
      </h1>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200
          ${
            dragActive
              ? "border-blue-400 bg-blue-50/50"
              : selectedFile
                ? "border-green-200 bg-green-50/30"
                : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
        />

        {!selectedFile ? (
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          >
            <div className="p-4 bg-blue-50 rounded-full">
              <Upload size={32} className="text-blue-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                <span className="text-blue-600 hover:text-blue-700">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">Any file up to 2GB</p>
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gray-100 rounded-lg">
                <File size={24} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {handleOverflowText(selectedFile.name, 25)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemove}
                className="p-1.5 ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar + Status */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600 truncate max-w-[70%]">
              {/* {statusMessage || "Uploading…"} */}
            </span>
            <span className="text-gray-500 font-medium tabular-nums">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                uploadStage === "processing"
                  ? "bg-amber-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>
          {uploadStage === "processing" && (
            <p className="text-xs text-amber-600 mt-1.5">
              Processing on server — don't close this window
            </p>
          )}
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">
            File uploaded successfully!
          </span>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">
            Upload failed. Please try again.
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && uploadStatus !== "success" && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 
                     disabled:bg-blue-300 disabled:cursor-not-allowed
                     text-white font-medium text-sm rounded-lg
                     transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isUploading ? "Uploading…" : "Upload File"}
          </button>
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="px-4 py-2.5 bg-white hover:bg-gray-50
                     disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                     text-gray-600 font-medium text-sm rounded-lg
                     border border-gray-200
                     transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
