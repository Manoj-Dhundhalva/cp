import { Router } from "express";
import { getFilteredProblems, getProblems } from "./problem.controller.js";
import { ProblemFilterSchema, ProblemSchema } from "./problem.schema.js";
import { validateBody } from "@/middlewares/validation.middleware.js";

const router = Router();

router.post("/", validateBody(ProblemSchema), getProblems);
router.post("/filter", validateBody(ProblemFilterSchema), getFilteredProblems);

export default router;
