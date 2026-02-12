interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export type { AuthStore };
