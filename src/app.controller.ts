import express from "express";
import authRouter from "./modules/auth/auth.controller";
import userRouter from "./modules/user/user.controller";
import studentRouter from "./modules/student/student.controller";
import groupRouter from "./modules/group/group.controller";
import attendanceRouter from "./modules/attendance/attendance.controller";
import cronRouter from "./modules/cron/cron.controller";
import { globalErrorHandler, notFoundHandler } from "./utils/response/error.response";
import connectDB from "./DB/dbConfig";
import { initModels } from "./DB/model";
import CronManager from "./cron";

const bootstrap = (app: express.Application) => {
  connectDB()
    .then(() => initModels())
    .then(() => CronManager.initialize())
    .catch((err) => {
      console.error("Failed to initialize database/models/cron:", err);
    });
  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/student", studentRouter);
  app.use("/group", groupRouter);
  app.use("/attendance", attendanceRouter);
  app.use("/cron", cronRouter);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);
};

export default bootstrap;
