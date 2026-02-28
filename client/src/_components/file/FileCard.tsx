import FileIconMapper from "./FileIconMapper";
import useModalStore from "../../store/useModal";

interface Props {
  name: string;
  file_id: string | number;
  isLoading: boolean;
  children?: React.ReactNode;
  mime_type: string;
}

const FileCard = ({ mime_type, file_id, name, isLoading, children }: Props) => {
  const { openModal } = useModalStore();
  return (
    <div
      className="relative group m-2"
      onClick={() => {
        openModal("streamImage", { file_id: file_id });
      }}
    >
      <div
        className={`bg-slate-50 hover:bg-slate-200 p-4 flex flex-col items-center rounded-lg shadow-sm w-48 text-center transition ${
          isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {children}

        <img
          src={FileIconMapper(mime_type)}
          className="h-24 w-24 mb-2"
          alt=""
          draggable={false}
        />

        <p className="font-medium text-gray-700 truncate max-w-full px-2">
          {name}
        </p>
      </div>
    </div>
  );
};

export default FileCard;
