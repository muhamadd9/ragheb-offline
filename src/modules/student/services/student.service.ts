import { NextFunction, Request, Response } from "express";
import { AppError, catchAsync } from "../../../utils/response/error.response";
import { successResponse } from "../../../utils/response/success.response";
import { getPaginationParams, buildPaginationMeta } from "../../../utils/pagination";
import Student from "../../../DB/model/Student.model";
import { buildListQuery } from "../../../utils/db.helper";
import { CreateStudentDto, UpdateStudentDto } from "../student.dto";

class StudentService {
    createStudent = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const payload = req.body as CreateStudentDto;
        const existingByStudentId = await Student.findOne({ where: { student_id: payload.student_id } as any });
        if (existingByStudentId) {
            return next(new AppError(`Student with student_id ${payload.student_id} already exists`, 400)) as unknown as NextFunction;
        }
        if (payload.uid !== undefined && payload.uid !== null) {
            const existingByUid = await Student.findOne({ where: { uid: payload.uid } as any });
            if (existingByUid) {
                return next(new AppError(`Student with uid ${payload.uid} already exists`, 400)) as unknown as NextFunction;
            }
        }
        const created = await Student.create(payload as any);
        return successResponse({ res, status: 201, message: "Student created", data: created });
    });

    updateStudent = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const { id } = req.params as { id: string };
        const student: any = await Student.findByPk(id);
        if (!student) return next(new AppError("Student not found", 404)) as unknown as NextFunction;

        // If updating a unique field, ensure no conflict
        const body = req.body as UpdateStudentDto;
        if (body.student_id !== undefined && Number(body.student_id) !== Number(student.get("student_id"))) {
            const conflict = await Student.findOne({ where: { student_id: body.student_id } as any });
            if (conflict) {
                return next(new AppError(`Student with student_id ${body.student_id} already exists`, 400)) as unknown as NextFunction;
            }
        }
        if (body.uid !== undefined && body.uid !== null && Number(body.uid) !== Number(student.get("uid"))) {
            const conflictUid = await Student.findOne({ where: { uid: body.uid } as any });
            if (conflictUid) {
                return next(new AppError(`Student with uid ${body.uid} already exists`, 400)) as unknown as NextFunction;
            }
        }
        await student.update(body as UpdateStudentDto);
        return successResponse({ res, status: 200, message: "Student updated", data: student });
    });

    deleteStudent = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const { id } = req.params as { id: string };
        const student: any = await Student.findByPk(id);
        if (!student) return next(new AppError("Student not found", 404)) as unknown as NextFunction;
        await student.destroy();
        return successResponse({ res, status: 200, message: "Student deleted", data: {} });
    });

    getStudentById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const { id } = req.params as { id: string };
        const student = await Student.findByPk(id);
        if (!student) return next(new AppError("Student not found", 404)) as unknown as NextFunction;
        return successResponse({ res, status: 200, message: "Student fetched", data: student });
    });

    getAllStudents = catchAsync(async (req: Request, res: Response): Promise<Response> => {
        const { page, limit, offset } = getPaginationParams(req);
        const { where, order } = buildListQuery({
            req,
            model: Student,
            defaultSortField: "id",
            defaultSortDirection: "DESC",
        });
        const { rows, count } = await Student.findAndCountAll({
            where,
            limit,
            offset,
            order,
        });
        return successResponse({
            res,
            status: 200,
            message: "Students fetched",
            data: { items: rows, meta: buildPaginationMeta({ page, limit, total: count }) },
        });
    });
}

export default new StudentService();


