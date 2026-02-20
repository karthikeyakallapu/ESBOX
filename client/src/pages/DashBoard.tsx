import useSWR from "swr";
import apiService from "../service/apiService";
import type { UserFolder } from "../types/folder";
import type { UserFile } from "../types/file";
import File from "../_components/file/File";
import Folder from "../_components/folder/Folder";
import useFolderNavStore from "../store/useFolderNav";
import Loading from "../_components/loaders/Loading";
import Error from "../_components/loaders/Error";

import { HardDrive, RefreshCw } from "lucide-react";

const DashBoard = () => {
  const { data, error, isLoading, mutate } = useSWR("files-and-folders", () =>
    apiService.getAllFilesAndFolders({ parentId: null }),
  );
  const { enterFolder } = useFolderNavStore();

  const handleFolderNav = (folder: UserFolder) => {
    enterFolder({ id: folder.id.toString(), name: folder.name });
  };

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} handleRefresh={handleRefresh} />;

  return (
    <div className="h-full bg-linear-to-br from-gray-50/30 to-white p-6 rounded-3xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-blue-400 to-blue-700  rounded-xl shadow-lg shadow-blue-200">
            <HardDrive className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
        </div>

        {/* Refresh Button */}
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

      <div className="flex flex-wrap gap-4">
        {/* Folders */}
        {data?.folders && data.folders.length > 0 ? (
          data.folders.map((folder: UserFolder) => (
            <div
              key={folder.id}
              onClick={() => handleFolderNav(folder)}
              className="cursor-pointer"
            >
              <Folder folder={folder} />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-8 text-gray-400">
            No folders found.
          </div>
        )}

        {/* Files */}
        {data?.files && data.files.length > 0
          ? data.files.map((file: UserFile) => (
              <div key={file.id}>
                <File file={file} />
              </div>
            ))
          : data?.folders &&
            data.folders.length === 0 && (
              <div className="w-full text-center py-8 text-gray-400">
                No files found.
              </div>
            )}
      </div>
    </div>
  );
};

export default DashBoard;
