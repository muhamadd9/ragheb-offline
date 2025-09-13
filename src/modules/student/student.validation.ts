import Joi from "joi";

export const createStudentSchema = Joi.object({
    student_id: Joi.number().integer().required(),
    first_name: Joi.string().max(100).required(),
    last_name: Joi.string().max(100).required(),
    email: Joi.string().email().allow(null).optional(),
    phone_number: Joi.string().max(30).required(),
    guardian_number: Joi.string().max(30).required(),
    birth_date: Joi.string().isoDate().allow(null).optional(),
    national_id: Joi.string().max(40).allow(null).optional(),
    gender: Joi.string().max(10).required(),
    level: Joi.number().integer().required(),
    school_name: Joi.string().max(150).allow(null).optional(),
    is_subscription: Joi.boolean().optional(),
    subscription_date: Joi.string().isoDate().allow(null).optional(),
    uid: Joi.number().integer().optional(),
    archived: Joi.boolean().optional(),
    blocked: Joi.boolean().optional(),
    group_id: Joi.number().integer().allow(null).optional(),
});

export const updateStudentSchema = createStudentSchema.fork(
    [
        "student_id",
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "guardian_number",
        "birth_date",
        "national_id",
        "gender",
        "level",
        "school_name",
        "is_subscription",
        "subscription_date",
        "uid",
        "archived",
        "blocked",
        "group_id",
    ],
    (schema) => schema.optional()
);


