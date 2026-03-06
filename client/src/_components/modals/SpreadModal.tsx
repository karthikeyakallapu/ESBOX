import { useEffect, type ReactNode } from "react";
import useModalStore from "../../store/useModal";
import { useRef } from "react";

export type ModalSize = "md" | "lg" | "xl" | "xl5" | "full";

const modalSizeClasses: Record<ModalSize, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
  xl5: "max-w-5xl",
  full: "max-w-[95vw]",
};

const SpreadModal = ({
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
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeModal}
    >
      <div
        ref={modalRef}
        className={`w-full ${modalSizeClasses[size]} rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default SpreadModal;
