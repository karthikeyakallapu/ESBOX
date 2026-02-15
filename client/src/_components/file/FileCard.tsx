import FileIconMapper from "./FileIconMapper";

interface Props {
  name: string;
  isLoading: boolean;
  children?: React.ReactNode;
  mime_type: string;
}

const FileCard = ({ mime_type, name, isLoading, children }: Props) => {
  return (
    <div className="relative group m-2">
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
        />

        <p className="font-medium text-gray-700 truncate max-w-full px-2">
          {name}
        </p>
      </div>
    </div>
  );
};

export default FileCard;
