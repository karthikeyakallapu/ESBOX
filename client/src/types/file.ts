interface UserFile {
  id: number;
  parent_id: number | string | null;
  filename: string;
  mime_type: string;
  size: number;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
}

interface DeleteFileModalData {
  file: UserFile;
  onDelete: (fileId: string | number) => Promise<void>;
}

interface RenameFileModalData {
  file: UserFile;
  onRename: (new_name: string) => Promise<void>;
}
interface FileUpdate {
  action: "rename" | "move" | "star" | "unstar" | "delete";
  payload?: {
    new_name?: string;
  };
}
export type { UserFile, DeleteFileModalData, FileUpdate, RenameFileModalData };
