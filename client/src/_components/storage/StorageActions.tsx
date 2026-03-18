import useModalStore from "../../store/useModal";
import { FolderPlus, Upload, Link } from "lucide-react";
import useAuthStore from "../../store/useAuth";

const StorageActions = () => {
  const { openModal } = useModalStore();
  const { user } = useAuthStore();

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 my-4 sm:my-6 bg-linear-to-br from-white to-gray-50/50 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/40 backdrop-blur-sm">
        {/* New Folder Button - Primary */}
        <button
          onClick={() => openModal("newFolder")}
          className="group relative flex flex-row sm:flex-col items-center justify-center sm:justify-start gap-2 sm:gap-2 px-4 sm:px-8 py-3 sm:py-4 overflow-hidden
                     bg-linear-to-br from-blue-600 to-blue-700
                     text-white font-medium text-sm rounded-lg sm:rounded-xl
                     transition-all duration-300 shadow-md shadow-blue-200
                     hover:shadow-xl hover:shadow-blue-300 hover:scale-[1.01] sm:hover:scale-[1.02]
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     active:scale-[0.98] w-full sm:w-auto"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-br from-transparent via-white/20 to-transparent" />

          <FolderPlus
            size={20}
            strokeWidth={1.5}
            className="relative group-hover:rotate-3 transition-transform"
          />
          <span className="relative text-xs sm:text-sm whitespace-nowrap">
            New Folder
          </span>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-0.5 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Upload Button */}
        <button
          onClick={() => openModal("uploadFile")}
          className="group relative flex flex-row sm:flex-col items-center justify-center sm:justify-start gap-2 sm:gap-2 px-4 sm:px-8 py-3 sm:py-4
                     bg-white hover:bg-gray-50
                     text-gray-700 hover:text-gray-900 font-medium text-sm rounded-lg sm:rounded-xl
                     border border-gray-200 hover:border-gray-300
                     transition-all duration-300 shadow-sm hover:shadow-md
                     focus:outline-none focus:ring-2 focus:ring-gray-200
                     active:scale-[0.98] flex-1 w-full sm:w-auto"
        >
          <Upload
            size={20}
            strokeWidth={1.5}
            className="group-hover:scale-110 group-hover:-translate-y-0.5 transition-all"
          />
          <span className="text-xs sm:text-sm">Upload</span>

          <div className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-transparent group-hover:border-emerald-200/50 transition-all" />
        </button>

        {/* Connect Telegram Button */}
        {user && !user.is_telegram_connected && (
          <button
            onClick={() => openModal("telegramLink")}
            className="group relative flex flex-row sm:flex-col items-center justify-center sm:justify-start gap-2 sm:gap-2 px-4 sm:px-8 py-3 sm:py-4
                     bg-white hover:bg-gray-50
                     text-gray-700 hover:text-gray-900 font-medium text-sm rounded-lg sm:rounded-xl
                     border border-gray-200 hover:border-gray-300
                     transition-all duration-300 shadow-sm hover:shadow-md
                     focus:outline-none focus:ring-2 focus:ring-gray-200
                     active:scale-[0.98] flex-1 w-full sm:w-auto "
          >
            <Link
              size={20}
              strokeWidth={1.5}
              className="group-hover:scale-110 group-hover:rotate-6 transition-all"
            />
            <span className="text-xs sm:text-sm whitespace-nowrap">
              Connect Telegram
            </span>

            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
    </>
  );
};

export default StorageActions;
