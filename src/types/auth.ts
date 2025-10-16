export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  expires: string;
}
