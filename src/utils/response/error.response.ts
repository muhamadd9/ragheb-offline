import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
export const catchAsync = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export const globalErrorHandler: ErrorRequestHandler = (error, req: Request, res: Response, next: NextFunction) => {
  if (error.code === 11000 && error.keyValue) {
    const duplicatedField = Object.keys(error.keyValue)[0];
    error.message = `${duplicatedField} already exists.`;
    error.statusCode = 400;
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    errors: undefined,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errors: undefined,
  });
};
