interface GenericMessage {
  message: string;
}

type ModalComponent =
  | "newFolder"
  | "renameFolder"
  | "deleteFolder"
  | "deleteFile"
  | "uploadFile"
  | "telegramLink";

interface ModalStore<T = unknown> {
  isOpen: boolean;
  component: ModalComponent | null;
  data: T | null;
  openModal: <T>(component: ModalComponent, data?: T) => void;
  closeModal: () => void;
}

export type { GenericMessage, ModalStore, ModalComponent };
