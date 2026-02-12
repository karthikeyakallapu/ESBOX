import { type ReactNode } from "react";
import { X } from "lucide-react";
import useModalStore from "../../store/useModal";

const StorageOptionModal = ({ children }: { children: ReactNode }) => {
  const { closeModal } = useModalStore();
  return (
    <div
      className="fixed inset-0 z-50 
                  bg-[#1a1a1a]/40
                  flex items-center justify-center
                  animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md mx-4
                    bg-white/95 backdrop-blur-0
                    rounded-2xl shadow-2xl shadow-black/10
                    border border-white/20
                    animate-in zoom-in-95 duration-300"
      >
        <div className="flex items-center justify-end p-6 pb-4">
          <button
            onClick={closeModal}
            className="rounded-lg p-2 text-gray-400 
                       hover:bg-gray-100/80 hover:text-gray-600
                       transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default StorageOptionModal;
