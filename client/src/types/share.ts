export interface DeleteSharedLinkModalData {
  shareToken: string;
  fileName: string;
  onDelete: () => Promise<void>;
}

export interface ChangeSharedLinkPasswordModalData {
  shareToken: string;
  fileName: string;
  onChangePassword: () => Promise<void>;
}

export interface UpdateSharedLinkExpiryModalData {
  shareToken: string;
  fileName: string;
  currentExpiry?: string;
  onUpdate: () => Promise<void>;
}
