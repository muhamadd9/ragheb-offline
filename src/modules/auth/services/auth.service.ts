import { NextFunction, Request, Response } from "express";
import { AppError, catchAsync } from "../../../utils/response/error.response";
import { LoginDto, RegisterDto } from "../auth.dto";
import User, { Role } from "../../../DB/model/User.model";
import { generateToken } from "../../../utils/jwt/token";
import { successResponse } from "../../../utils/response/success.response";
import { compareHash, generateHash } from "../../../utils/security/hash.security";

class AuthenticationService {
  register = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
    const { name, username, password, role }: RegisterDto & { username: string } = req.body as any;

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return next(new AppError("Username already exists", 400)) as unknown as NextFunction;
    }

    const created = await User.create({
      username,
      name,
      password: generateHash(password),
      role: (role as Role) || undefined,
    } as any);

    return successResponse({
      res,
      status: 201,
      message: "User registered successfully",
      data: { id: (created as any).get("id"), name: (created as any).get("name"), username: (created as any).get("username"), role: (created as any).get("role") },
    });
  });

  login = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
    const { username, password }: LoginDto & { username: string } = req.body as any;

    const user: any = await User.findOne({ where: { username } });
    if (!user) {
      return next(new AppError("User not found", 404)) as unknown as NextFunction;
    }

    if (!compareHash(password, user.get("password"))) {
      return next(new AppError("Wrong password", 400)) as unknown as NextFunction;
    }

    const token = generateToken({
      payload: { id: String(user.get("id")), userName: user.get("username") as string },
    });

    return successResponse({
      res,
      status: 200,
      message: "Login Successfully",
      data: { token },
    });
  });
}

export default new AuthenticationService();
