import { Download, Frown } from "lucide-react";
import useModalStore from "../../../store/useModal";
import useFileActions from "../fileActions";
import type { UserFile } from "../../../types/file";

const UnSupported = () => {
  const { data } = useModalStore();
  const file = data as UserFile;
  const { downloadFile } = useFileActions(file);

  if (!file) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 bg-white rounded-2xl min-h-100 shadow-sm border border-gray-100">
      <div className="bg-gray-50 p-4 rounded-full">
        <Frown size={48} className="text-gray-400" />
      </div>

      <div className="text-center">
        <h3 className="text-gray-900 text-lg font-medium mb-2">
          Sorry, Preview Not Available
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {file.name || "This file"} cannot be previewed in the browser.
        </p>
      </div>

      <button
        onClick={() => downloadFile(file.id, file.name)}
        className="flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 
                   rounded-lg transition-all border border-blue-200
                   focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <Download size={18} className="text-blue-600" />
        <span className="text-blue-700 text-sm font-medium">Download File</span>
      </button>
    </div>
  );
};

export default UnSupported;
