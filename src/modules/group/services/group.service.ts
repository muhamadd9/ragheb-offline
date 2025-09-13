import { NextFunction, Request, Response } from "express";
import { AppError, catchAsync } from "../../../utils/response/error.response";
import { successResponse } from "../../../utils/response/success.response";
import Group from "../../../DB/model/Group.model";
import Student from "../../../DB/model/Student.model";
import { getPaginationParams, buildPaginationMeta } from "../../../utils/pagination";
import { buildListQuery } from "../../../utils/db.helper";
import { fn, col, Op } from "sequelize";
import { CreateGroupDto, UpdateGroupDto } from "../group.dto";

class GroupService {
    createGroup = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const payload = req.body as CreateGroupDto;

        // ensure unique by name+level combination (business choice)
        const exists = await (Group as any).findOne({ where: { group_name: payload.group_name, level: payload.level } });
        if (exists) {
            return next(new AppError("Group with same name and level already exists", 400)) as unknown as NextFunction;
        }

        const created = await (Group as any).create(payload as any);
        return successResponse({ res, status: 201, message: "Group created", data: created });
    });

    getAllGroups = catchAsync(async (req: Request, res: Response): Promise<Response> => {
        const { page, limit, offset } = getPaginationParams(req);
        const { where, order } = buildListQuery({
            req,
            model: Group as any,
            defaultSortField: "id",
            defaultSortDirection: "DESC",
        });

        const { rows, count } = await (Group as any).findAndCountAll({
            where,
            limit,
            offset,
            order,
            attributes: {
                include: [[fn("COUNT", col("students.id")), "students_count"]],
            },
            include: [
                {
                    model: Student as any,
                    as: "students",
                    attributes: [],
                    required: false,
                },
            ],
            group: ["Group.id"],
            distinct: true,
            subQuery: false,
        });

        // When using group by, Sequelize returns count as an array. Normalize it.
        const total = Array.isArray(count) ? count.length : count;

        return successResponse({
            res,
            status: 200,
            message: "Groups fetched",
            data: { items: rows, meta: buildPaginationMeta({ page, limit, total }) },
        });
    });

    getGroupById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const { id } = req.params as { id: string };
        const group: any = await (Group as any).findByPk(id, {
            include: [
                {
                    model: Student as any,
                    as: "students",
                    where: { blocked: false },
                    required: false,
                    attributes: [
                        "id",
                        "student_id",
                        "first_name",
                        "last_name",
                        "level",
                        "uid",
                        "blocked",
                        "archived",
                    ],
                },
            ],
        });
        if (!group) return next(new AppError("Group not found", 404)) as unknown as NextFunction;
        return successResponse({ res, status: 200, message: "Group fetched", data: group });
    });

    updateGroup = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const { id } = req.params as { id: string };
        const group: any = await (Group as any).findByPk(id);
        if (!group) return next(new AppError("Group not found", 404)) as unknown as NextFunction;

        const body = req.body as UpdateGroupDto;
        if (body.group_name !== undefined || body.level !== undefined) {
            const newName = body.group_name ?? group.get("group_name");
            const newLevel = body.level ?? group.get("level");
            const conflict = await (Group as any).findOne({ where: { group_name: newName, level: newLevel, id: { [Op.ne]: id } } as any });
            if (conflict) {
                return next(new AppError("Another group with same name and level exists", 400)) as unknown as NextFunction;
            }
        }

        await group.update(body as any);
        return successResponse({ res, status: 200, message: "Group updated", data: group });
    });

    deleteGroup = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const { id } = req.params as { id: string };
        const group: any = await (Group as any).findByPk(id);
        if (!group) return next(new AppError("Group not found", 404)) as unknown as NextFunction;

        await group.destroy();
        return successResponse({ res, status: 200, message: "Group deleted", data: {} });
    });
}

export default new GroupService();


