import { compareSync, hashSync } from "bcryptjs";

export const generateHash = (password: string, salt: number = parseInt(process.env.SALT as string)): string => {
  return hashSync(password, salt);
};

export const compareHash = (password: string, hash: string): boolean => {
  return compareSync(password, hash);
};
