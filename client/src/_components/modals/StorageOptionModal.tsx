import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import useModalStore from "../../store/useModal";
import { useRef } from "react";

export type ModalSize = "md" | "lg" | "xl" | "full";

const modalSizeClasses: Record<ModalSize, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
  full: "max-w-[95vw]",
};

const StorageOptionModal = ({
  children,
  size = "md",
}: {
  children: ReactNode;
  size?: ModalSize;
}) => {
  const { closeModal } = useModalStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        console.log("entered");

        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeModal]);

  return (
    <div
      className="fixed inset-0 z-50 
                  bg-[#1a1a1a]/40
                  flex items-center justify-center
                  animate-in fade-in duration-200 "
    >
      <div
        className={`w-full ${modalSizeClasses[size]} mx-4
                    bg-white  backdrop-blur-0
                    rounded-2xl shadow-2xl shadow-black/10
                    border border-white/20
                    animate-in zoom-in-95 duration-300`}
        ref={modalRef}
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
