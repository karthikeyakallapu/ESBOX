interface UserFile {
  id: number;
  parent_id: number | string | null;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

interface DeleteFileModalData {
  file: UserFile;
  onDelete: (fileId: string | number) => Promise<void>;
}

export type { UserFile, DeleteFileModalData };
