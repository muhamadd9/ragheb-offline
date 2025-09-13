import { Request } from "express";
import { Op, WhereOptions, Order } from "sequelize";
import { AppError } from "./response/error.response";

type AnyRecord = Record<string, unknown>;

export interface IListQueryBuildOptions {
    req: Request;
    model?: any;
    allowedFilterFields?: string[];
    defaultSortField?: string;
    defaultSortDirection?: "ASC" | "DESC";
}

export interface IListQueryBuildResult {
    where: WhereOptions<AnyRecord>;
    order: Order;
}

const DEFAULT_SEARCH_FIELDS: string[] = ["name", "title", "username", "email"];

export const buildListQuery = ({ req, model, allowedFilterFields, defaultSortField = "id", defaultSortDirection = "DESC" }: IListQueryBuildOptions): IListQueryBuildResult => {
    const query = req.query as AnyRecord;

    const reservedKeys = new Set(["page", "limit", "offset", "q", "sort", "order"]);

    // Resolve allowed fields from model attributes or provided list
    const modelAttributes: string[] = model?.rawAttributes ? Object.keys(model.rawAttributes) : [];
    const allowedFields: string[] = allowedFilterFields && allowedFilterFields.length > 0 ? allowedFilterFields : (modelAttributes.length > 0 ? modelAttributes : DEFAULT_SEARCH_FIELDS);

    // Classify fields as string-like (LIKE) vs exact and capture type
    const stringLikeFields = new Set<string>();
    const fieldTypeByName = new Map<string, string>();
    if (model?.rawAttributes) {
        for (const [attrName, attr] of Object.entries<any>(model.rawAttributes)) {
            const typeKey = String((attr as any).type?.key || (attr as any).type || "").toUpperCase();
            fieldTypeByName.set(attrName, typeKey);
            if (["STRING", "TEXT", "UUID", "UUIDV4", "CHAR", "CITEXT"].includes(typeKey)) {
                stringLikeFields.add(attrName);
            }
        }
    } else {
        DEFAULT_SEARCH_FIELDS.forEach((f) => stringLikeFields.add(f));
    }

    // Validate query fields
    for (const key of Object.keys(query)) {
        if (reservedKeys.has(key)) continue;
        if (!allowedFields.includes(key)) {
            throw new AppError(`Invalid filter field: ${key}`, 400);
        }
    }

    const where: WhereOptions<AnyRecord> = {};

    // Text search across string-like fields
    const searchTerm = (query.q as string | undefined)?.trim();
    if (searchTerm && stringLikeFields.size > 0) {
        const likeClause = { [Op.like]: `%${escapeLike(searchTerm)}%` } as any;
        (where as any)[Op.or] = Array.from(stringLikeFields).map((field) => ({ [field]: likeClause }));
    }

    // Field filters
    Object.entries(query).forEach(([key, value]) => {
        if (reservedKeys.has(String(key))) return;
        if (value === undefined || value === null || value === "") return;

        const valueString = String(value).trim();
        if (valueString.includes(",")) {
            const values = valueString.split(",").map((v) => v.trim());
            const coercedValues = values.map((v) => coerceValueForField(key, v, fieldTypeByName));
            (where as any)[key] = { [Op.in]: coercedValues };
            return;
        }

        if (stringLikeFields.has(key)) {
            (where as any)[key] = { [Op.like]: `%${escapeLike(valueString)}%` } as any;
        } else {
            (where as any)[key] = coerceValueForField(key, valueString, fieldTypeByName);
        }
    });

    // Sorting validation
    const sortField = (query.sort as string) || defaultSortField || "id";
    if (sortField && !allowedFields.includes(sortField)) {
        throw new AppError(`Invalid sort field: ${sortField}`, 400);
    }
    const sortDir = ((query.order as string) || defaultSortDirection || "DESC").toString().toUpperCase() === "ASC" ? "ASC" : "DESC";
    const order: Order = [[sortField, sortDir]];

    return { where, order };
};

// Escape % and _ for LIKE queries
const escapeLike = (value: string): string => value.replace(/[%_]/g, (m) => "\\" + m);

// Coerce query string values to proper JS types based on Sequelize attribute type
const coerceValueForField = (fieldName: string, rawValue: string, fieldTypeByName: Map<string, string>): any => {
    const typeKey = fieldTypeByName.get(fieldName) || "";
    const upper = String(rawValue).toUpperCase();

    if (["BOOLEAN"].includes(typeKey)) {
        if (["TRUE", "1"].includes(upper)) return true;
        if (["FALSE", "0"].includes(upper)) return false;
        // invalid boolean literal
        throw new AppError(`Invalid boolean for ${fieldName}: ${rawValue}`, 400);
    }

    if (["INTEGER", "BIGINT", "FLOAT", "DOUBLE", "DECIMAL", "REAL"].includes(typeKey)) {
        const num = Number(rawValue);
        if (Number.isNaN(num)) throw new AppError(`Invalid number for ${fieldName}: ${rawValue}`, 400);
        return num;
    }

    // Dates can be filtered as exact strings or by LIKE by callers if needed; keep as string
    return rawValue;
};


