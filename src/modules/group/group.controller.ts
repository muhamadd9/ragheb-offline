import express from "express";
import { authentication, authorization } from "../../middleware/auth.middleware";
import validation from "../../middleware/validation.middleware";
import { createGroupSchema, updateGroupSchema } from "./group.validation";
import GroupService from "./services/group.service";

const router: express.Router = express.Router();

router.post(
    "/",
    authentication(),
    authorization(["admin", "assistant"]),
    validation({ body: createGroupSchema }),
    GroupService.createGroup
);

router.get(
    "/",
    authentication(),
    authorization(["admin", "assistant"]),
    GroupService.getAllGroups
);

router.get(
    "/:id",
    authentication(),
    authorization(["admin", "assistant"]),
    GroupService.getGroupById
);

router.patch(
    "/:id",
    authentication(),
    authorization(["admin", "assistant"]),
    validation({ body: updateGroupSchema }),
    GroupService.updateGroup
);

router.delete(
    "/:id",
    authentication(),
    authorization(["admin", "assistant"]),
    GroupService.deleteGroup
);

export default router;


