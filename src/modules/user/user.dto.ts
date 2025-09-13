export interface CreateUserDto {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
    role?: "admin" | "assistant";
}

export interface UpdateUserDto {
    name?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    role?: "admin" | "assistant";
    blocked?: boolean;
}


