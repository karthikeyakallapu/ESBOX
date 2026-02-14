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
  onRename: (newName: string) => Promise<void>;
}

interface DeleteFolderModalData {
  folder: UserFolder;
  onDelete: (folderId: string | number) => Promise<void>;
}

type FolderModalData = RenameFolderModalData | DeleteFolderModalData;

export type {
  UserFolder,
  FolderNavStore,
  NavFolder,
  RenameFolderModalData,
  DeleteFolderModalData,
  FolderModalData,
};
