interface UserFile {
  id: number;
  parent_id: number | string | null;
  name: string;
  mime_type: string;
  size: number;
  is_starred: boolean;
  uploaded_at: string;
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

interface FileShareCreate {
  file_id: number;
  password: string;
  expire_in_hours: number;
}

interface ShareFileModalData {
  file: UserFile;
  onShare: (file: FileShareCreate) => Promise<unknown>;
}

export type {
  UserFile,
  DeleteFileModalData,
  FileUpdate,
  RenameFileModalData,
  FileShareCreate,
  ShareFileModalData,
};
