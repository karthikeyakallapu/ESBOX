import { create } from "zustand";
import type { FolderNavStore, NavFolder } from "../types/folder";

const useFolderNavStore = create<FolderNavStore>((set) => ({
  currentPath: [],
  enterFolder: (folder: NavFolder) => {
    set((state) => ({
      currentPath: [...state.currentPath, folder],
    }));
  },
  jumpToFolder: (folder: NavFolder) => {
    set((state) => {
      const index = state.currentPath.findIndex((f) => f.id === folder.id);
      if (index === -1) return state;
      return {
        currentPath: state.currentPath.slice(0, index + 1), // Keep folders up to the clicked one
      };
    });
  },
  jumpToRoot: () => {
    set({ currentPath: [] });
  },
}));

export default useFolderNavStore;
