import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  Loader2,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  Code,
  Table,
  Folder,
  Clock,
  HardDrive,
  AlertCircle,
  FileCheck,
  Sparkles,
} from "lucide-react";
import useSWR from "swr";
import { useDebounce } from "../../hooks/useDebounce";
import apiService from "../../service/apiService";
import useModalStore from "../../store/useModal";

type FileItem = {
  id: number;
  name: string;
  mime_type: string;
  size: number;
  parent_id: number | null;
  uploaded_at: string;
};

const SearchFiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const inputRef = useRef<HTMLInputElement>(null);

  const { closeModal, openModal } = useModalStore();

  const { data, error, isLoading } = useSWR<FileItem[]>(
    debouncedSearch ? ["esbox-search", debouncedSearch] : null,
    () => apiService.searchFiles(debouncedSearch),
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getFileIcon = (mime: string, name: string) => {
    // Image files
    if (mime.startsWith("image/")) {
      return <ImageIcon size={18} className="text-emerald-500" />;
    }

    // Video files
    if (mime.startsWith("video/")) {
      return <Video size={18} className="text-purple-500" />;
    }

    // Audio files
    if (mime.startsWith("audio/")) {
      return <Music size={18} className="text-pink-500" />;
    }

    // PDF files
    if (mime === "application/pdf") {
      return <FileText size={18} className="text-red-500" />;
    }

    // Archive files
    if (
      mime.includes("zip") ||
      mime.includes("rar") ||
      mime.includes("tar") ||
      mime.includes("7z")
    ) {
      return <Archive size={18} className="text-amber-500" />;
    }

    // Code files
    if (
      mime.includes("javascript") ||
      mime.includes("json") ||
      mime.includes("html") ||
      mime.includes("css") ||
      mime.includes("typescript")
    ) {
      return <Code size={18} className="text-blue-500" />;
    }

    // Spreadsheet files
    if (
      mime.includes("sheet") ||
      mime.includes("excel") ||
      mime.includes("csv")
    ) {
      return <Table size={18} className="text-green-600" />;
    }

    // Document files
    if (mime.includes("document") || mime.includes("text/")) {
      return <FileText size={18} className="text-indigo-500" />;
    }

    // Folder (if parent_id is null, it might be a folder)
    if (mime === "folder" || name.includes(".") === false) {
      return <Folder size={18} className="text-yellow-500" />;
    }

    // Default file icon based on extension
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "mp3" || ext === "wav")
      return <Music size={18} className="text-pink-500" />;
    if (ext === "mp4" || ext === "mov")
      return <Video size={18} className="text-purple-500" />;
    if (ext === "jpg" || ext === "png" || ext === "gif")
      return <ImageIcon size={18} className="text-emerald-500" />;
    if (ext === "pdf") return <FileText size={18} className="text-red-500" />;
    if (ext === "zip" || ext === "rar")
      return <Archive size={18} className="text-amber-500" />;
    if (ext === "js" || ext === "ts" || ext === "py")
      return <Code size={18} className="text-blue-500" />;
    if (ext === "csv" || ext === "xlsx")
      return <Table size={18} className="text-green-600" />;

    // Default
    return <File size={18} className="text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleOpenFile = (file: FileItem) => {
    if (file.mime_type.startsWith("image/")) {
      openModal("streamImage", file);
    } else if (file.mime_type.startsWith("application/pdf")) {
      openModal("streamPDF", file);
    } else if (file.mime_type.startsWith("video/")) {
      openModal("streamVideo", file);
    } else {
      openModal("unSupported", file);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl w-full mx-auto">
      {/* Header with gradient */}
      <div className="p-5 border-b border-gray-100 bg-linear-to-r from-purple-50 to-pink-50 rounded-t-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} className="text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">Search Files</h2>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by file name, type, or content..."
            className="w-full h-14 pl-12 pr-12 bg-white border border-gray-200 rounded-xl text-lg 
              focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400
              placeholder:text-gray-400 transition-all"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 
                hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <div className="max-h-[60vh] overflow-y-auto p-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <File className="h-5 w-5 text-purple-300" />
              </div>
            </div>
            <p className="mt-6 text-gray-500 font-medium">Searching files...</p>
            <p className="text-sm text-gray-400">This may take a moment</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">
              Failed to load search results
            </p>
            <p className="text-sm text-gray-500 mt-1">Please try again</p>
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <>
            {data.length === 0 ? (
              <div className="text-center py-16 ">
                <div className="inline-flex items-center  justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                  <FileCheck className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium">No files found</p>
                <p className="text-sm text-gray-400 mt-1">
                  We couldn't find any files matching "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 
                    bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-400">
                  <span>{data.length} files found</span>
                  <span>Sorted by relevance</span>
                </div>

                {data.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-linear-to-r
                      hover:from-purple-50 hover:to-pink-50 cursor-pointer group transition-all"
                    onClick={() => handleOpenFile(file)}
                  >
                    {/* Icon with background */}
                    <div
                      className="shrink-0 w-10 h-10 bg-gray-100 rounded-lg 
                      flex items-center justify-center group-hover:bg-white transition-colors"
                    >
                      {getFileIcon(file.mime_type, file.name)}
                    </div>

                    {/* File details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="flex items-center gap-1 text-gray-400">
                          <HardDrive size={12} />
                          {formatFileSize(file.size)}
                        </span>

                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock size={12} />
                          {formatDate(file.uploaded_at)}
                        </span>

                        {file.parent_id && (
                          <span className="text-gray-300">•</span>
                        )}
                      </div>
                    </div>

                    {/* Quick action */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white rounded-lg">
                        <FileCheck size={16} className="text-purple-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Initial state */}
        {!debouncedSearch && !isLoading && !data && (
          <div className="text-center py-16">
            <div
              className="inline-flex items-center justify-center w-20 h-20 
             bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl mb-6"
            >
              <Search className="h-10 w-10 text-purple-400" />
            </div>
            <p className="text-gray-700 font-medium">
              Start typing to search files
            </p>
            <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
              Search by file name, type, or content. Press{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                ⌘K
              </kbd>{" "}
              to quickly search.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-2xl">
        <div className="text-xs text-gray-400">
          {data && !isLoading && `${data.length} results`}
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-800 
              hover:bg-gray-200 rounded-lg text-sm transition-colors"
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFiles;
