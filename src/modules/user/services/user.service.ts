import { NextFunction, Request, Response } from "express";
import { AppError, catchAsync } from "../../../utils/response/error.response";
import { successResponse } from "../../../utils/response/success.response";
import { getPaginationParams, buildPaginationMeta } from "../../../utils/pagination";
import User from "../../../DB/model/User.model";
import { buildListQuery } from "../../../utils/db.helper";

class UserService {
    me = catchAsync(async (req: Request, res: Response): Promise<Response> => {
        const user: any = (req as any).user;
        return successResponse({
            res,
            status: 200,
            message: "Current user",
            data: {
                id: user.get("id"),
                name: user.get("name"),
                username: user.get("username"),
                role: user.get("role"),
                blocked: user.get("blocked"),
            },
        });
    });

    getAllUsers = catchAsync(async (req: Request, res: Response): Promise<Response> => {
        const { page, limit, offset } = getPaginationParams(req);
        const { where, order } = buildListQuery({
            req,
            model: User,
            allowedFilterFields: ["id", "name", "username", "role", "blocked"],
            defaultSortField: "id",
            defaultSortDirection: "DESC",
        });
        const { rows, count } = await User.findAndCountAll({
            attributes: ["id", "name", "username", "role", "blocked"],
            where,
            limit,
            offset,
            order,
        });
        return successResponse({
            res,
            status: 200,
            message: "Users fetched successfully",
            data: { items: rows, meta: buildPaginationMeta({ page, limit, total: count }) },
        });
    });

    blockToggle = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const { id, blocked } = req.params as { id: string; blocked: string };
        const actingUser: any = (req as any).user;
        if (actingUser && String(actingUser.get ? actingUser.get("id") : actingUser.id) === String(id)) {
            return next(new AppError("You cannot block/unblock yourself", 400)) as unknown as NextFunction;
        }
        const user: any = await User.findByPk(id);
        if (!user) return next(new AppError("User not found", 404)) as unknown as NextFunction;

        const normalized = String(blocked).toLowerCase();
        const setBlocked = normalized === "true" || normalized === "1";
        const currentBlocked = !!user.get("blocked");
        if (currentBlocked === setBlocked) {
            return successResponse({
                res,
                status: 200,
                message: `User is already ${setBlocked ? "blocked" : "unblocked"}`,
                data: { id: user.get("id"), blocked: currentBlocked },
            });
        }

        await user.update({ blocked: setBlocked });

        return successResponse({
            res,
            status: 200,
            message: `User ${setBlocked ? "blocked" : "unblocked"} successfully`,
            data: { id: user.get("id"), blocked: user.get("blocked") },
        });
    });

    remove = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response | NextFunction> => {
        const { id } = req.params as { id: string };
        const actingUser: any = (req as any).user;
        if (actingUser && String(actingUser.get ? actingUser.get("id") : actingUser.id) === String(id)) {
            return next(new AppError("You cannot delete yourself", 400)) as unknown as NextFunction;
        }
        const user: any = await User.findByPk(id);
        if (!user) return next(new AppError("User not found", 404)) as unknown as NextFunction;
        await user.destroy();
        return successResponse({ res, status: 200, message: "User deleted", data: {} });
    });
}

export default new UserService();


