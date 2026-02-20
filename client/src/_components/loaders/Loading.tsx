import { HardDrive } from "lucide-react";

const Loading = () => {
  return (
    <div className="h-full flex items-center justify-center min-h-100">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <HardDrive
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400"
            size={24}
          />
        </div>
 
      </div>
    </div>
  );
};

export default Loading;
