import { create } from "zustand";
import type { FolderNavStore, NavFolder } from "../types/folder";

const useFolderNavStore = create<FolderNavStore>((set, get) => ({
  currentPath: [],
  getCurrentFolderId: () => {
    const { currentPath } = get();
    const lastFolder = currentPath[currentPath.length - 1];
    return lastFolder ? Number(lastFolder.id) : null;
  },
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
