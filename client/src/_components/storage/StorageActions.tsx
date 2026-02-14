import StorageOptionModal from "../modals/StorageOptionModal";
import useModalStore from "../../store/useModal";
import { FolderPlus, Upload, Link } from "lucide-react";
import NewFolder from "../folder/NewFolder";
import RenameFolder from "../folder/RenameFolder";
import DeleteFolder from "../folder/DeleteFolder";
import DeleteFile from "../file/DeleteFile";
import UploadFile from "../file/upload/UploadFile";

const StorageActions = () => {
  const { isOpen, openModal, component } = useModalStore();

  return (
    <>
      <div className="flex items-center gap-3 p-4 my-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => openModal("newFolder")}
          className="flex flex-col items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 
                     text-white font-medium text-sm rounded-lg
                     transition-all duration-200 shadow-sm hover:shadow
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FolderPlus size={22} strokeWidth={1.5} />
          <span>New Folder</span>
        </button>

        <button
          className="flex flex-col items-center gap-2 px-8 py-3.5 bg-white hover:bg-gray-50
                     text-gray-700 font-medium text-sm rounded-lg
                     border border-gray-200
                     transition-all duration-200 shadow-sm hover:shadow
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
          onClick={() => openModal("uploadFile")}
        >
          <Upload size={22} strokeWidth={1.5} />
          <span>Upload</span>
        </button>

        <button
          className="flex flex-col items-center gap-2 px-8 py-3.5 bg-white hover:bg-gray-50
                     text-gray-700 font-medium text-sm rounded-lg
                     border border-gray-200
                     transition-all duration-200 shadow-sm hover:shadow
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <Link size={22} strokeWidth={1.5} />
          <span>Share</span>
        </button>
      </div>

      {isOpen && component === "newFolder" && (
        <StorageOptionModal>
          <NewFolder />
        </StorageOptionModal>
      )}

      {isOpen && component === "renameFolder" && (
        <StorageOptionModal>
          <RenameFolder />
        </StorageOptionModal>
      )}

      {isOpen && component === "deleteFolder" && (
        <StorageOptionModal>
          <DeleteFolder />
        </StorageOptionModal>
      )}

      {isOpen && component === "deleteFile" && (
        <StorageOptionModal>
          <DeleteFile />
        </StorageOptionModal>
      )}

      {isOpen && component === "uploadFile" && (
        <StorageOptionModal>
          <UploadFile />
        </StorageOptionModal>
      )}
    </>
  );
};

export default StorageActions;
