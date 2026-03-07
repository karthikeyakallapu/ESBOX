import FileIconMapper from "./FileIconMapper";
import useModalStore from "../../store/useModal";
import type { UserFile } from "../../types/file";

interface Props {
  isLoading: boolean;
  children?: React.ReactNode;
  file?: UserFile;
}

const FileCard = ({ file, isLoading, children }: Props) => {
  const { openModal } = useModalStore();

  const handleOpen = () => {
    if (file?.mime_type.startsWith("image/")) {
      openModal("streamImage", file);
    } else if (file?.mime_type.startsWith("application/pdf")) {
      openModal("streamPDF", file);
    } else if (file?.mime_type.startsWith("video/")) {
      openModal("streamVideo", file);
    } else {
      openModal("unSupported", file);
    }
  };

  return (
    <div className="relative group m-2" onClick={handleOpen}>
      <div
        className={`bg-slate-50 hover:bg-slate-200 p-4 flex flex-col items-center rounded-lg shadow-sm w-48 text-center transition ${
          isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {children}

        <img
          src={FileIconMapper(file?.mime_type || "")}
          className="h-24 w-24 mb-2"
          alt=""
          draggable={false}
        />

        <p className="font-medium text-gray-700 truncate max-w-full px-2">
          {file?.name}
        </p>
      </div>
    </div>
  );
};

export default FileCard;
