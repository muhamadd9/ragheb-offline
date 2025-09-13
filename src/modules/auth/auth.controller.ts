import express from "express";
import AuthenticationService from "./services/auth.service";
import validation from "../../middleware/validation.middleware";
import { registerSchema, loginSchema } from "./auth.validation";
const router: express.Router = express.Router();

router.post("/register", validation(registerSchema), AuthenticationService.register);
router.post("/login", validation(loginSchema), AuthenticationService.login);

export default router;
