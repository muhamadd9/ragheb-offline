import Joi from "joi";
import { DayOfWeek } from "../../DB/model/Group.model";

export const createGroupSchema = Joi.object({
    group_name: Joi.string().max(150).required(),
    start_time: Joi.string().max(10).required(),
    level: Joi.number().integer().min(1).max(3).required(),
    days: Joi.array()
        .items(Joi.string().valid(...(DayOfWeek as readonly string[])))
        .min(1)
        .required(),
});

export const updateGroupSchema = createGroupSchema.fork(
    ["group_name", "start_time", "level", "days"],
    (schema) => schema.optional()
);


