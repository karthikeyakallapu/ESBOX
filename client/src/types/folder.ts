import type { UserFile } from "./file";

interface UserFolder {
  user_id: number;
  is_root: boolean;
  name: string;
  created_at: string;
  id: number;
  is_starred: boolean;
  parent_id: number | null;
  updated_at: string | null;
}

interface NavFolder {
  id: string;
  name: string;
}

interface FolderNavStore {
  currentPath: { id: string; name: string }[];
  enterFolder: (folder: NavFolder) => void;
  jumpToFolder: (folder: NavFolder) => void;
  jumpToRoot: () => void;
  getCurrentFolderId: () => string | number | null;
}

interface RenameFolderModalData {
  folder: UserFolder;
  onRename: (new_name: string) => Promise<void>;
}

interface DeleteFolderModalData {
  folder: UserFolder;
  onDelete: (folderId: string | number) => Promise<void>;
}

type FolderModalData = RenameFolderModalData | DeleteFolderModalData;

interface FolderUpdateData {
  name?: string;
  parent_id?: number | string | null;
  is_starred?: boolean;
}

interface FolderData {
  folders: UserFolder[];
  files: UserFile[];
}

export type {
  UserFolder,
  FolderNavStore,
  NavFolder,
  RenameFolderModalData,
  DeleteFolderModalData,
  FolderModalData,
  FolderUpdateData,
  FolderData,
};
