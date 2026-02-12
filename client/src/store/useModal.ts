import { create } from "zustand";
import type { ModalStore } from "../types/common";

const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  component: null,
  data: null,
  openModal: (component, data) =>
    set({ isOpen: true, component: component || null, data }),
  closeModal: () => set({ isOpen: false, component: null, data: null }),
}));

export default useModalStore;
