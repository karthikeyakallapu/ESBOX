interface UserFile {
  id: number;
  filename: string;
}

interface DeleteFileModalData {
  file: UserFile;
  onDelete: (fileId: string | number) => Promise<void>;
}

export type { UserFile, DeleteFileModalData };
