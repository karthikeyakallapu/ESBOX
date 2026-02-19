import useSWR from "swr";
import apiService from "../service/apiService";
import type { UserFolder } from "../types/folder";
import type { UserFile } from "../types/file";
import File from "../_components/file/File";
import Folder from "../_components/folder/Folder";
import useFolderNavStore from "../store/useFolderNav";
import { useEffect } from "react";

const DashBoard = () => {
  const { data, error, isLoading } = useSWR("files-and-folders", () =>
    apiService.getAllFilesAndFolders({ parentId: null }),
  );
  const { enterFolder, jumpToRoot } = useFolderNavStore();

  useEffect(() => {
    jumpToRoot();
  }, [jumpToRoot]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message || "error..."}</div>;

  const handleFolderNav = (folder: UserFolder) => {
    enterFolder({ id: folder.id.toString(), name: folder.name });
  };

  return (
    <div className="h-full">
      <h1 className="text-xl font-semibold m-2 rounded-xl">DashBoard</h1>

      {/*  folders  */}
      <div className="flex items-center flex-wrap gap-4 p-4">
        {data?.folders.map((folder: UserFolder) => (
          <div key={folder.id} onClick={() => handleFolderNav(folder)}>
            <Folder folder={folder} />
          </div>
        )) || "No folders found."}

        {/*  files */}
        {data?.files.map((file: UserFile) => (
          <div key={file.id}>
            <File file={file} />
          </div>
        )) || "No files found."}
      </div>
    </div>
  );
};

export default DashBoard;
