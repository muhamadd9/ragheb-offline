import { NextFunction, Request, Response } from "express";
import { AppError, catchAsync } from "../../../utils/response/error.response";
import { successResponse } from "../../../utils/response/success.response";
import Attendance from "../../../DB/model/Attendance.model";
import Student from "../../../DB/model/Student.model";
import Group from "../../../DB/model/Group.model";
import { CreateAttendanceDto, UpdateAttendanceStatusDto } from "../attendance.dto";
import { Op } from "sequelize";
import { sequelize } from "../../../DB/dbConfig";
import { getCurrentDay, isWithinTimeWindow, getTodayDate, getDayGroup, areDaysInSameGroup, timeToMinutes } from "../../../utils/time.helper";
import { getPaginationParams, buildPaginationMeta } from "../../../utils/pagination";
import { buildListQuery } from "../../../utils/db.helper";
import { fn, col } from "sequelize";

class AttendanceService {
    createAttendance = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const payload = req.body as CreateAttendanceDto;
        const user_id = (req as any).user?.id;

        // Find the student
        const student = await Student.findOne({
            where: { student_id: Number(payload.student_id) } as any,
            include: [{ model: Group as any, as: "group" }]
        });

        if (!student) {
            return next(new AppError("Student not found", 404)) as unknown as NextFunction;
        }

        let targetGroup: any = null;

        if (payload.group_id) {
            // If group_id is provided, validate the student is in this group
            targetGroup = await Group.findByPk(payload.group_id);
            if (!targetGroup) {
                return next(new AppError("Group not found", 404)) as unknown as NextFunction;
            }

            if (Number(student.get("group_id")) !== Number(payload.group_id)) {
                const studentGroup = await Group.findByPk(student.get("group_id") as number);
                const studentName = `${student.get("first_name")} ${student.get("last_name")}`;
                const groupName = studentGroup ? studentGroup.get("group_name") : "No Group";
                const groupDays = studentGroup ? (studentGroup.get("days") as string[] || []) : [];
                const groupLevel = studentGroup ? studentGroup.get("level") : "N/A";
                const daysString = Array.isArray(groupDays) ? groupDays.join(", ") : "No days";

                return next(new AppError(
                    `This student is in group "${groupName}" (Level: ${groupLevel}, Days: ${daysString}) and student name: ${studentName}`,
                    400
                )) as unknown as NextFunction;
            }

            // Check if today is in the group's scheduled days
            const currentDay = getCurrentDay();
            let groupDays = targetGroup.get("days") as string[] || [];

            // Handle case where days might be stored as JSON string
            if (typeof groupDays === 'string') {
                try {
                    groupDays = JSON.parse(groupDays);
                } catch (e) {
                    groupDays = [];
                }
            }

            if (!groupDays.includes(currentDay)) {
                const studentName = `${student.get("first_name")} ${student.get("last_name")}`;
                const groupName = targetGroup.get("group_name");
                const daysString = Array.isArray(groupDays) ? groupDays.join(", ") : "No days";

                return next(new AppError(
                    `Today (${currentDay}) is not a scheduled day for group "${groupName}" (Days: ${daysString}). Student: ${studentName}`,
                    400
                )) as unknown as NextFunction;
            }

            // Check if group time has already passed (allow attendance if time passed)
            const startTime = targetGroup.get("start_time") as string;
            const currentTime = new Date().toTimeString().slice(0, 5);
            const currentMinutes = timeToMinutes(currentTime);
            const startMinutes = timeToMinutes(startTime);

            // Allow attendance if current time is after group start time
            if (currentMinutes < startMinutes) {
                const studentName = `${student.get("first_name")} ${student.get("last_name")}`;
                const groupName = targetGroup.get("group_name");

                return next(new AppError(
                    `Group "${groupName}" has not started yet (starts at ${startTime}). Current time: ${currentTime}. Student: ${studentName}`,
                    400
                )) as unknown as NextFunction;
            }
        } else {
            // If no group_id provided, find the group that matches current time and day
            const currentDay = getCurrentDay();

            // Find groups that match current day
            const groupsForToday = await Group.findAll({
                where: {
                    [Op.and]: [
                        // Use JSON_CONTAINS for MariaDB JSON array search
                        sequelize.literal(`JSON_CONTAINS(days, '"${currentDay}"')`)
                    ]
                }
            });

            // Filter groups that are within the time window (1 hour before + 1 hour after)
            const matchingGroups = groupsForToday.filter(group => {
                const startTime = group.get("start_time") as string;
                return isWithinTimeWindow(startTime, 60, 60); // 60 minutes before + 60 minutes after
            });

            if (matchingGroups.length === 0) {
                return next(new AppError("No group is currently active (within 1 hour before and 1 hour after start time)", 400)) as unknown as NextFunction;
            }

            // Check if student is in any of the matching groups
            const studentGroupId = student.get("group_id");
            targetGroup = matchingGroups.find(group => group.get("id") === studentGroupId);

            if (!targetGroup) {
                const studentGroup = await Group.findByPk(studentGroupId as number);
                const studentName = `${student.get("first_name")} ${student.get("last_name")}`;
                const groupName = studentGroup ? studentGroup.get("group_name") : "No Group";
                const groupDays = studentGroup ? (studentGroup.get("days") as string[] || []) : [];
                const groupLevel = studentGroup ? studentGroup.get("level") : "N/A";
                const daysString = Array.isArray(groupDays) ? groupDays.join(", ") : "No days";

                return next(new AppError(
                    `This student is in group "${groupName}" (Level: ${groupLevel}, Days: ${daysString}) and student name: ${studentName}`,
                    400
                )) as unknown as NextFunction;
            }
        }

        // Check if attendance already exists for this student in the same day group
        const today = getTodayDate();
        const currentDay = getCurrentDay();
        const currentDayGroup = getDayGroup(currentDay);

        if (!currentDayGroup) {
            return next(new AppError("Invalid day for attendance", 400)) as unknown as NextFunction;
        }

        // Check if attendance already exists for the exact same day
        const existingAttendanceToday = await Attendance.findOne({
            where: {
                student_id: Number(payload.student_id),
                group_id: targetGroup.get("id"),
                attendance_date: today
            } as any
        });

        if (existingAttendanceToday) {
            const currentStatus = existingAttendanceToday.get("status");

            // If already present, return error
            if (currentStatus === "present") {
                return next(new AppError("Attendance already recorded as present for this student today", 400)) as unknown as NextFunction;
            }

            // If absent, update to present
            if (currentStatus === "absent") {
                await existingAttendanceToday.update({
                    status: "present",
                    recorded_by: user_id,
                    recorded_at: new Date()
                });

                // Fetch the updated attendance record with student and group data
                const updatedAttendance = await Attendance.findByPk(existingAttendanceToday.get("id") as number, {
                    include: [
                        {
                            model: Student as any,
                            as: "student",
                            attributes: ["id", "student_id", "first_name", "last_name", "email", "phone_number", "level", "group_id"]
                        },
                        {
                            model: Group as any,
                            as: "group",
                            attributes: ["id", "group_name", "start_time", "level", "days"]
                        }
                    ]
                });

                return successResponse({
                    res,
                    status: 200,
                    message: "Attendance status updated from absent to present successfully",
                    data: updatedAttendance
                });
            }
        }

        // Get all attendance records for this student in this group
        const existingAttendances = await Attendance.findAll({
            where: {
                student_id: Number(payload.student_id),
                group_id: targetGroup.get("id")
            } as any,
            include: [
                {
                    model: Group as any,
                    as: "group",
                    attributes: ["days"]
                }
            ]
        });

        // Check if student already attended on any day in the same day group
        for (const attendance of existingAttendances) {
            const group = (attendance as any).get("group");
            let groupDays = group ? (group.get("days") || []) : [];

            // Handle case where days might be stored as JSON string
            if (typeof groupDays === 'string') {
                try {
                    groupDays = JSON.parse(groupDays);
                } catch (e) {
                    groupDays = [];
                }
            }

            // Check if any day in the group's schedule is in the same day group as current day
            for (const groupDay of groupDays) {
                if (areDaysInSameGroup(groupDay, currentDay)) {
                    return next(new AppError(`Attendance already recorded for ${groupDay}`, 400)) as unknown as NextFunction;
                }
            }
        }

        // Create attendance record
        const attendanceData = {
            group_id: targetGroup.get("id"),
            student_id: Number(payload.student_id),
            attendance_date: today,
            status: "present" as const,
            recorded_by: user_id,
            recorded_at: new Date()
        };


        const createdAttendance = await Attendance.create(attendanceData as any);

        // Fetch the attendance record with student and group data
        const attendanceWithDetails = await Attendance.findByPk(createdAttendance.get("id") as number, {
            include: [
                {
                    model: Student as any,
                    as: "student",
                    attributes: ["id", "student_id", "first_name", "last_name", "email", "phone_number", "level", "group_id"]
                },
                {
                    model: Group as any,
                    as: "group",
                    attributes: ["id", "group_name", "start_time", "level", "days"]
                }
            ]
        });

        return successResponse({
            res,
            status: 201,
            message: "Attendance recorded successfully",
            data: attendanceWithDetails
        });
    });

    getAllAttendances = catchAsync(async (req: Request, res: Response): Promise<Response> => {
        const { page, limit, offset } = getPaginationParams(req);
        const query = req.query as any;

        // Build base where conditions
        const where: any = {};

        // Filter by attendance_date (today or specific date)
        if (query.date) {
            where.attendance_date = query.date;
        }

        // Filter by group_id
        if (query.group_id) {
            where.group_id = Number(query.group_id);
        }

        // Filter by status
        if (query.status) {
            where.status = query.status;
        }

        // Filter by day (requires joining with Group to check days array)
        let dayFilter = null;
        if (query.day) {
            dayFilter = query.day;
        }

        // Build include conditions
        const includeConditions: any[] = [
            {
                model: Student as any,
                as: "student",
                attributes: ["id", "student_id", "first_name", "last_name", "email", "phone_number", "level", "group_id"]
            },
            {
                model: Group as any,
                as: "group",
                attributes: ["id", "group_name", "start_time", "level", "days"]
            }
        ];

        // Add day filter to Group include if specified
        if (dayFilter) {
            includeConditions[1].where = {
                [Op.and]: [
                    sequelize.literal(`JSON_CONTAINS(days, '"${dayFilter}"')`)
                ]
            };
        }

        // Get paginated results
        const { rows, count } = await Attendance.findAndCountAll({
            where,
            include: includeConditions,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            distinct: true
        });

        // Calculate statistics if no status filter is applied
        let statistics = null;
        if (!query.status) {
            const statsResult = await Attendance.findAll({
                where,
                include: dayFilter ? [includeConditions[1]] : [],
                attributes: [
                    [fn("COUNT", col("Attendance.id")), "total"],
                    [fn("SUM", sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")), "present"],
                    [fn("SUM", sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")), "absent"]
                ],
                raw: true
            });

            if (statsResult && statsResult.length > 0) {
                const stats = statsResult[0] as any;
                statistics = {
                    total: parseInt(stats.total) || 0,
                    present: parseInt(stats.present) || 0,
                    absent: parseInt(stats.absent) || 0
                };
            }
        }

        const responseData: any = {
            items: rows,
            meta: buildPaginationMeta({ page, limit, total: count })
        };

        if (statistics) {
            responseData.statistics = statistics;
        }

        return successResponse({
            res,
            status: 200,
            message: "Attendances fetched",
            data: responseData
        });
    });

    updateAttendanceStatus = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const payload = req.body as UpdateAttendanceStatusDto;
        const user_id = (req as any).user?.id;

        // Find the student
        const student = await Student.findOne({
            where: { student_id: payload.student_id } as any,
            include: [{ model: Group as any, as: "group" }]
        });

        if (!student) {
            return next(new AppError("Student not found", 404)) as unknown as NextFunction;
        }

        let targetGroup: any = null;
        let targetDate = payload.attendance_date || getTodayDate();

        if (payload.group_id) {
            // If group_id is provided, validate the student is in this group
            targetGroup = await Group.findByPk(payload.group_id);
            if (!targetGroup) {
                return next(new AppError("Group not found", 404)) as unknown as NextFunction;
            }

            if (Number(student.get("group_id")) !== Number(payload.group_id)) {
                const studentGroup = await Group.findByPk(student.get("group_id") as number);
                const studentName = `${student.get("first_name")} ${student.get("last_name")}`;
                const groupName = studentGroup ? studentGroup.get("group_name") : "No Group";
                const groupDays = studentGroup ? (studentGroup.get("days") as string[] || []) : [];
                const groupLevel = studentGroup ? studentGroup.get("level") : "N/A";
                const daysString = Array.isArray(groupDays) ? groupDays.join(", ") : "No days";

                return next(new AppError(
                    `This student is in group "${groupName}" (Level: ${groupLevel}, Days: ${daysString}) and student name: ${studentName}`,
                    400
                )) as unknown as NextFunction;
            }
        } else {
            // If no group_id provided, use student's current group
            targetGroup = await Group.findByPk(student.get("group_id") as number);
            if (!targetGroup) {
                return next(new AppError("Student is not assigned to any group", 400)) as unknown as NextFunction;
            }
        }

        // Find existing attendance record
        const existingAttendance = await Attendance.findOne({
            where: {
                student_id: payload.student_id,
                group_id: targetGroup.get("id"),
                attendance_date: targetDate
            } as any
        });

        if (!existingAttendance) {
            return next(new AppError("No attendance record found for this student on the specified date", 404)) as unknown as NextFunction;
        }

        // Check if already present
        const currentStatus = existingAttendance.get("status");
        if (currentStatus === "present") {
            return next(new AppError("Student is already marked as present for this date", 400)) as unknown as NextFunction;
        }

        // Always update to "present" when this endpoint is called
        await existingAttendance.update({
            status: "present",
            recorded_by: user_id,
            recorded_at: new Date()
        });

        // Fetch the updated attendance record with student and group data
        const updatedAttendance = await Attendance.findByPk(existingAttendance.get("id") as number, {
            include: [
                {
                    model: Student as any,
                    as: "student",
                    attributes: ["id", "student_id", "first_name", "last_name", "email", "phone_number", "level", "group_id"]
                },
                {
                    model: Group as any,
                    as: "group",
                    attributes: ["id", "group_name", "start_time", "level", "days"]
                }
            ]
        });

        return successResponse({
            res,
            status: 200,
            message: "Attendance status updated to present successfully",
            data: updatedAttendance
        });
    });
}

export default new AttendanceService();
