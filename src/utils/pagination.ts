import { Request } from "express";

export interface IPaginationParams {
    page: number;
    limit: number;
    offset: number;
}

export interface IPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const getPaginationParams = (req: Request, defaultLimit: number = 20): IPaginationParams => {
    const page = Math.max(parseInt(String(req.query.page || 1)), 1);
    const limit = Math.max(Math.min(parseInt(String(req.query.limit || defaultLimit)), 100), 1);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

export const buildPaginationMeta = ({ page, limit, total }: { page: number; limit: number; total: number }): IPaginationMeta => {
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    return { page, limit, total, totalPages };
};


