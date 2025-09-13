import express, { Request, Response } from "express";
import { authentication, authorization } from "../../middleware/auth.middleware";
import CronManager from "../../cron";
import { successResponse } from "../../utils/response/success.response";
import { AppError, catchAsync } from "../../utils/response/error.response";

const router: express.Router = express.Router();

/**
 * Get status of all cron jobs
 */
router.get(
    "/status",
    authentication(),
    authorization(["admin"]),
    catchAsync(async (req: Request, res: Response) => {
        const status = CronManager.getJobsStatus();
        return successResponse({
            res,
            status: 200,
            message: "Cron jobs status retrieved",
            data: status
        });
    })
);

/**
 * Get status of a specific cron job
 */
router.get(
    "/status/:jobName",
    authentication(),
    authorization(["admin"]),
    catchAsync(async (req: Request, res: Response) => {
        const { jobName } = req.params;
        const status = CronManager.getJobStatus(jobName);

        if (status.error) {
            throw new AppError(`Job '${jobName}' not found`, 404);
        }

        return successResponse({
            res,
            status: 200,
            message: `Cron job '${jobName}' status retrieved`,
            data: status
        });
    })
);

/**
 * Start a specific cron job
 */
router.post(
    "/start/:jobName",
    authentication(),
    authorization(["admin"]),
    catchAsync(async (req: Request, res: Response) => {
        const { jobName } = req.params;
        const success = CronManager.startJob(jobName);

        if (!success) {
            throw new AppError(`Failed to start job '${jobName}'`, 400);
        }

        return successResponse({
            res,
            status: 200,
            message: `Cron job '${jobName}' started successfully`,
            data: { jobName, status: "started" }
        });
    })
);

/**
 * Stop a specific cron job
 */
router.post(
    "/stop/:jobName",
    authentication(),
    authorization(["admin"]),
    catchAsync(async (req: Request, res: Response) => {
        const { jobName } = req.params;
        const success = CronManager.stopJob(jobName);

        if (!success) {
            throw new AppError(`Failed to stop job '${jobName}'`, 400);
        }

        return successResponse({
            res,
            status: 200,
            message: `Cron job '${jobName}' stopped successfully`,
            data: { jobName, status: "stopped" }
        });
    })
);

/**
 * Stop all cron jobs
 */
router.post(
    "/stop-all",
    authentication(),
    authorization(["admin"]),
    catchAsync(async (req: Request, res: Response) => {
        await CronManager.stopAllJobs();

        return successResponse({
            res,
            status: 200,
            message: "All cron jobs stopped successfully",
            data: { status: "all_stopped" }
        });
    })
);

export default router;
