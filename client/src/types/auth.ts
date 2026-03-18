interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    is_telegram_connected: boolean;
  } | null;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export type { AuthStore };
