import express from "express";
import { authentication, authorization } from "../../middleware/auth.middleware";
import validation from "../../middleware/validation.middleware";
import { createAttendanceSchema, updateAttendanceStatusSchema } from "./attendance.validation";
import AttendanceService from "./services/attendance.service";

const router: express.Router = express.Router();

router.post(
    "/",
    authentication(),
    authorization(["admin", "assistant"]),
    validation({ body: createAttendanceSchema }),
    AttendanceService.createAttendance
);

router.get(
    "/",
    authentication(),
    authorization(["admin", "assistant"]),
    AttendanceService.getAllAttendances
);

router.patch(
    "/update-status",
    authentication(),
    authorization(["admin", "assistant"]),
    validation({ body: updateAttendanceStatusSchema }),
    AttendanceService.updateAttendanceStatus
);

export default router;
