export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  role?: "admin" | "assistant";
}
