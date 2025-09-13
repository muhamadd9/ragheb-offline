import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

interface IPayload extends JwtPayload {
  id?: Types.ObjectId | string;
  email?: string;
  userName?: string;
}
interface IGenerateTokenOptions {
  payload: IPayload;
  signature?: string;
  expiresIn?: string | number;
}

export const generateToken = ({
  payload,
  signature = process.env.SIGNATURE as string,
  expiresIn = process.env.EXPIRESIN as string,
}: IGenerateTokenOptions) => {
  return jwt.sign(payload, signature, { expiresIn: parseInt(expiresIn as string) });
};

export const verifyToken = ({ token, signature = process.env.SIGNATURE as string }: { token: string; signature?: string }) => {
  return jwt.verify(token, signature) as IPayload;
};
