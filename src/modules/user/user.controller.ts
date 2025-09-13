import express from "express";
import { authentication, authorization, IAuthRequest } from "../../middleware/auth.middleware";
import UserService from "./services/user.service";
const router: express.Router = express.Router();

router.get("/me", authentication(), UserService.me);

router.get("/", authentication(), authorization(["admin"]), UserService.getAllUsers);

router.patch("/:id/block/:blocked", authentication(), authorization(["admin"]), UserService.blockToggle);

router.delete("/:id", authentication(), authorization(["admin"]), UserService.remove);

export default router;


