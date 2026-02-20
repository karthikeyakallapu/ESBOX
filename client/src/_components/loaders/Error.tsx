import { AlertCircle } from "lucide-react";

interface Props {
  error: Error | null;
  handleRefresh: () => void;
}

const Error = ({ error, handleRefresh }: Props) => {
  return (
    <div>
      <div className="h-full flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-2xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <p className="text-red-600 font-medium">
            Error: {error?.message || "Failed to load data"}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;
