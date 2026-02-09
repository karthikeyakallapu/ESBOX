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

export type { UserFolder };
