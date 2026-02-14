interface UserFile {
  id: number;
  parent_id: number | string | null;
  filename: string;
}

interface DeleteFileModalData {
  file: UserFile;
  onDelete: (fileId: string | number) => Promise<void>;
}

export type { UserFile, DeleteFileModalData };
