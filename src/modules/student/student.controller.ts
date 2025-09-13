import express from "express";
import { authentication, authorization } from "../../middleware/auth.middleware";
import validation from "../../middleware/validation.middleware";
import { createStudentSchema, updateStudentSchema } from "./student.validation";
import StudentService from "./services/student.service";

const router: express.Router = express.Router();

router.post(
    "/",
    authentication(),
    authorization(["admin", "assistant"]),
    validation({ body: createStudentSchema }),
    StudentService.createStudent
);

router.patch(
    "/:id",
    authentication(),
    authorization(["admin", "assistant"]),
    validation({ body: updateStudentSchema }),
    StudentService.updateStudent
);

router.delete(
    "/:id",
    authentication(),
    authorization(["admin", "assistant"]),
    StudentService.deleteStudent
);

router.get(
    "/:id",
    authentication(),
    authorization(["admin", "assistant"]),
    StudentService.getStudentById
);

router.get(
    "/",
    authentication(),
    authorization(["admin", "assistant"]),
    StudentService.getAllStudents
);

export default router;


