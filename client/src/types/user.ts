interface UserRegister {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface UserLogin {
  email: string;
  password: string;
}

export type { UserRegister, UserLogin };
