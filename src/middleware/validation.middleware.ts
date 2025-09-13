import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/response/error.response";
import { ObjectSchema } from "joi";

const validation = (schema: Record<string, ObjectSchema>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
    const errors: Partial<Record<keyof Request, string[]>> = {};

    for (const key of Object.keys(schema)) {
      const value = (req[key as keyof Request] ?? (key === "body" ? {} : req[key as keyof Request])) as unknown;
      const validationResult = schema[key].validate(value, {
        abortEarly: false,
        allowUnknown: false,
        presence: "required",
        errors: { label: "key", wrap: { label: "" } },
      });
      if (validationResult.error) {
        errors[key as keyof Request] = validationResult.error.details.map((err) => {
          const pathStr = Array.isArray(err.path) && err.path.length ? err.path.join(".") : key;
          const msg = err.message.replace(/"/g, "");
          return `${pathStr} : ${msg}`;
        });
      }
    }

    if (Object.keys(errors).length) {
      // flatten arrays into a single, comma-separated string per request key
      const flatErrors = Object.entries(errors).reduce((acc, [k, v]) => {
        acc[k as keyof Request] = (v as string[]).join(", ");
        return acc;
      }, {} as Partial<Record<keyof Request, string>>);
      return res.status(400).json({ success: false, message: "ValidationError", errors: flatErrors });
    }

    return next() as unknown as NextFunction;
  });
};

export default validation;
