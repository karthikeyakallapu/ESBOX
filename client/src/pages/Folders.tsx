import { useParams } from "react-router-dom";
import useSWR from "swr";
import apiService from "../service/apiService";
import Folder from "../_components/folder/Folder";
import type { UserFolder } from "../types/folder";
import useFolderNavStore from "../store/useFolderNav";

const Folders = () => {
  const { id } = useParams();
  const { enterFolder } = useFolderNavStore();

  const { data, error, isLoading } = useSWR(`sub_folder_${id}`, () =>
    apiService.getAllFilesAndFolders(id || null),
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message || "error..."}</div>;

  const handleFolderNav = (folder: UserFolder) => {
    enterFolder({ id: folder.id.toString(), name: folder.name });
  };

  return (
    <div className="p-4">
      {data.folders.length === 0 && data.files.length === 0 && (
        <div className="h-screen flex items-center justify-center">
          Empty folder.
        </div>
      )}
      {/*  folders  */}
      <div className="flex items-center  ">
        {data?.folders.map((folder: UserFolder) => (
          <div key={folder.id} onClick={() => handleFolderNav(folder)}>
            <Folder folder={folder} />
          </div>
        )) || "No folders found."}
      </div>
    </div>
  );
};

export default Folders;
