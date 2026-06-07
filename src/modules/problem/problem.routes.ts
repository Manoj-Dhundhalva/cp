import { Router } from "express";
import { getProblems } from "./problem.controller.js";
import { ProblemSchema } from "./problem.schema.js";
import { validateBody } from "@/middlewares/validation.middleware.js";

const router = Router();

router.post("/", validateBody(ProblemSchema), getProblems);

export default router;
