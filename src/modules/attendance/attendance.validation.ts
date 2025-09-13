import Joi from "joi";
import { AttendanceStatus } from "../../DB/model/Attendance.model";

export const createAttendanceSchema = Joi.object({
    group_id: Joi.number().integer().positive().optional(),
    student_id: Joi.number().integer().positive().required(),
    attendance_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
        "string.pattern.base": "Date must be in YYYY-MM-DD format"
    }),
    status: Joi.string().valid(...(AttendanceStatus as readonly string[])).optional(),
    recorded_by: Joi.number().integer().positive().optional(),
});

export const updateAttendanceSchema = Joi.object({
    status: Joi.string().valid(...(AttendanceStatus as readonly string[])).optional(),
    recorded_by: Joi.number().integer().positive().optional(),
});

export const updateAttendanceStatusSchema = Joi.object({
    student_id: Joi.number().integer().positive().required(),
    group_id: Joi.number().integer().positive().optional(),
    attendance_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
        "string.pattern.base": "Date must be in YYYY-MM-DD format"
    }),
});
