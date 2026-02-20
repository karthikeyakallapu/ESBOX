import StorageOptionModal from "../modals/StorageOptionModal";
import useModalStore from "../../store/useModal";
import { FolderPlus, Upload, Link } from "lucide-react";
import modalComponents from "../modals/modalComponents";

const StorageActions = () => {
  const { isOpen, openModal, component } = useModalStore();

  return (
    <>
      <div className="flex items-center gap-4 p-5 my-6 bg-linear-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/40 backdrop-blur-sm">
        {/* New Folder Button - Primary */}
        <button
          onClick={() => openModal("newFolder")}
          className="group relative flex flex-col items-center gap-2 px-8 py-4 overflow-hidden
                     bg-linear-to-br from-blue-600 to-blue-700
                     text-white font-medium text-sm rounded-xl
                     transition-all duration-300 shadow-md shadow-blue-200
                     hover:shadow-xl hover:shadow-blue-300 hover:scale-[1.02]
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     active:scale-[0.98]"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-br from-transparent via-white/20 to-transparent" />

          <FolderPlus
            size={22}
            strokeWidth={1.5}
            className="relative group-hover:rotate-3 transition-transform"
          />
          <span className="relative">New Folder</span>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button
          onClick={() => openModal("uploadFile")}
          className="group relative flex flex-col items-center gap-2 px-8 py-4
                     bg-white hover:bg-gray-50
                     text-gray-700 hover:text-gray-900 font-medium text-sm rounded-xl
                     border border-gray-200 hover:border-gray-300
                     transition-all duration-300 shadow-sm hover:shadow-md
                     focus:outline-none focus:ring-2 focus:ring-gray-200
                     active:scale-[0.98] flex-1"
        >
          <Upload
            size={22}
            strokeWidth={1.5}
            className="group-hover:scale-110 group-hover:-translate-y-0.5 transition-all"
          />
          <span>Upload</span>

          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-emerald-200/50 transition-all" />
        </button>

        <button
          onClick={() => openModal("telegramLink")}
          className="group relative flex flex-col items-center gap-2 px-8 py-4
                     bg-white hover:bg-gray-50
                     text-gray-700 hover:text-gray-900 font-medium text-sm rounded-xl
                     border border-gray-200 hover:border-gray-300
                     transition-all duration-300 shadow-sm hover:shadow-md
                     focus:outline-none focus:ring-2 focus:ring-gray-200
                     active:scale-[0.98] flex-1"
        >
          <Link
            size={22}
            strokeWidth={1.5}
            className="group-hover:scale-110 group-hover:rotate-6 transition-all"
          />
          <span>Connect Telegram</span>

          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Modals */}
      {modalComponents.map((modal) => {
        if (isOpen && component === modal.name) {
          return (
            <StorageOptionModal key={modal.name}>
              {modal.component}
            </StorageOptionModal>
          );
        }
      })}
    </>
  );
};

export default StorageActions;
