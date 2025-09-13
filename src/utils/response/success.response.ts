import { Response } from "express";

export const successResponse = ({
  res,
  status = 200,
  message = "Done",
  data,
}: {
  res: Response;
  status?: number;
  message?: string;
  data: any;
}): Response => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};
