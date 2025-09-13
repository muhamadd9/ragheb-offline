import joi from "joi";
import { Roles } from "../../DB/model/User.model";

export const registerSchema = {
  body: joi
    .object()
    .keys({
      name: joi.string().min(2).max(100).required(),
      username: joi.string().min(2).max(100).required(),
      password: joi
        .string()
        .min(8)
        .required()
      ,
      confirmPassword: joi.string().valid(joi.ref("password")).required().messages({ "any.only": "confirmPassword must match password" }),
      role: joi
        .string()
        .valid(...(Roles as readonly string[]))
        .optional(),
    })
    .required(),
};

export const loginSchema = {
  body: joi.object().keys({
    username: joi.string().min(2).max(100).required(),
    password: joi.string().required(),
  }),
};
