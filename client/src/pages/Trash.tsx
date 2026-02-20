import useSWR from "swr";
import apiService from "../service/apiService";
import type { UserFolder } from "../types/folder";
import type { UserFile } from "../types/file";
import File from "../_components/file/File";
import TrashFolderItem from "../_components/trash/TrashFolderItem";
import Loading from "../_components/loaders/Loading";

const TrashPage = () => {
  const { data, error, isLoading } = useSWR("user_trash", () =>
    apiService.getUserTrash(),
  );

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message || "Error loading trash"}</div>;

  if (!data || (data.folders.length === 0 && data.files.length === 0)) {
    return (
      <div className="h-screen flex items-center justify-center">No Trash.</div>
    );
  }

  return (
    <div className="p-4 flex flex-wrap gap-4">
      {/* Folders */}
      {data.folders.map((folder: UserFolder) => (
        <TrashFolderItem key={folder.id} folder={folder} />
      ))}

      {/* Files */}
      {data.files.map((file: UserFile) => (
        <File key={file.id} file={file} />
      ))}
    </div>
  );
};

export default TrashPage;
