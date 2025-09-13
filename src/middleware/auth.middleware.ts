import { NextFunction, Request, Response } from "express";
import { AppError, catchAsync } from "../utils/response/error.response";
import { verifyToken } from "../utils/jwt/token";
import User from "../DB/model/User.model";

export interface IAuthRequest extends Request {
  user?: any;
}

export const authentication = () => {
  return catchAsync(async (req: IAuthRequest, res: Response, next: NextFunction): Promise<NextFunction> => {
    const [bearer, token] = req.headers.authorization?.split(" ") || [];
    if (bearer !== "Bearer" || !token) {
      return next(new AppError("Unauthorized access", 401)) as unknown as NextFunction;
    }

    const decoded = verifyToken({ token });
    if (!decoded) {
      return next(new AppError("Invalid token", 401)) as unknown as NextFunction;
    }
    const user = decoded.id ? await User.findByPk(String(decoded.id)) : null;
    if (!user) {
      return next(new AppError("User not found", 404)) as unknown as NextFunction;
    }
    if (user.get && user.get("blocked")) {
      return next(new AppError("Your account is blocked", 403)) as unknown as NextFunction;
    }

    req.user = user;
    return next() as unknown as NextFunction;
  });
};

export const authorization = (allowedRoles: string[]) => {
  return (req: IAuthRequest, _res: Response, next: NextFunction): void => {
    const role = req.user?.get ? req.user.get("role") : req.user?.role;
    const isBlocked = req.user?.get ? req.user.get("blocked") : req.user?.blocked;
    if (isBlocked) {
      next(new AppError("Your account is blocked", 403));
      return;
    }
    if (!role || !allowedRoles.includes(role)) {
      next(new AppError("Forbidden", 403));
      return;
    }
    next();
  };
};
