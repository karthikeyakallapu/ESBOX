import useSWR from "swr";
import apiService from "../service/apiService";
import type { UserFolder } from "../types/folder";
import Folder from "../_components/storage/Folder";
const DashBoard = () => {
  const { data, error, isLoading } = useSWR("files-and-folders", () =>
    apiService.getAllFilesAndFolders(null),
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message || "error..."}</div>;

  return (
    <div className="h-full">
      <h1 className="text-xl font-semibold m-2">DashBoard</h1>

      {/* Add Folder */}
      <div className="h-24 m-2 rounded bg-slate-50"></div>

      {/*  folders  */}
      <div className="flex items-center  ">
        {data?.folders.map((folder: UserFolder) => (
          <Folder key={folder.id} folder={folder} />
        )) || "No folders found."}
      </div>
    </div>
  );
};

export default DashBoard;
