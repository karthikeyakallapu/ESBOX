import { useParams } from "react-router-dom";
import useSWR from "swr";
import apiService from "../service/apiService";
import Folder from "../_components/folder/Folder";
import type { UserFolder } from "../types/folder";
import useFolderNavStore from "../store/useFolderNav";
import type { UserFile } from "../types/file";
import File from "../_components/file/File";
import Loading from "../_components/loaders/Loading";
import Error from "../_components/loaders/Error";

import { RefreshCw, FolderOpen, FileIcon } from "lucide-react";

const Folders = () => {
  const { id } = useParams();
  const { enterFolder, currentPath } = useFolderNavStore();

  const { data, error, isLoading, mutate } = useSWR(`sub_folder_${id}`, () =>
    apiService.getAllFilesAndFolders({ parentId: id || null }),
  );

  const handleFolderNav = (folder: UserFolder) => {
    enterFolder({ id: folder.id.toString(), name: folder.name });
  };

  const handleRefresh = () => {
    mutate();
  };

  // Get current folder name from path
  const currentFolder = currentPath[currentPath.length - 1];

  if (isLoading) return <Loading />;

  if (error) return <Error error={error} handleRefresh={handleRefresh} />;

  const hasFolders = data?.folders && data.folders.length > 0;
  const hasFiles = data?.files && data.files.length > 0;

  return (
    <div className="bg-linear-to-br from-gray-50/30 to-white p-6 rounded-3xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-blue-400 to-blue-700 rounded-xl shadow-lg shadow-blue-200">
            <FolderOpen className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {currentFolder?.name || "Folder"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {hasFolders || hasFiles
                ? `${data?.folders.length || 0} folders • ${data?.files.length || 0} files`
                : "This folder is empty"}
            </p>
          </div>
        </div>

        {/* Stats & Refresh */}
        <div className="flex items-center gap-2">
          {hasFolders && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
              <FolderOpen size={14} className="text-purple-500" />
              <span className="text-xs font-medium text-gray-600">
                {data.folders.length}
              </span>
            </div>
          )}
          {hasFiles && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
              <FileIcon size={14} className="text-emerald-500" />
              <span className="text-xs font-medium text-gray-600">
                {data.files.length}
              </span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors group"
          >
            <RefreshCw
              size={16}
              className="text-gray-400 group-hover:text-gray-600 group-hover:rotate-180 transition-all duration-500"
            />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Folders */}
        {hasFolders
          ? data.folders.map((folder: UserFolder) => (
              <div
                key={folder.id}
                onClick={() => handleFolderNav(folder)}
                className="cursor-pointer "
              >
                <Folder folder={folder} />
              </div>
            ))
          : null}

        {/* Files */}
        {hasFiles
          ? data.files.map((file: UserFile) => (
              <div
                key={file.id}
                className="transition-transform hover:scale-105 hover:-translate-y-1 duration-200"
              >
                <File file={file} />
              </div>
            ))
          : null}

        {/* Empty State */}
        {!hasFolders && !hasFiles && (
          <div className="w-full flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-linear-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mb-4 border border-gray-200">
              <FolderOpen
                className="text-gray-400"
                size={40}
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              This folder is empty
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Folders;
