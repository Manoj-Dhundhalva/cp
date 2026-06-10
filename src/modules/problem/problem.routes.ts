import { Router } from "express";
import { getFilteredProblems, getProblems, getSolutions } from "./problem.controller.js";
import { ProblemFilterSchema } from "./problem.schema.js";
import { validateBody } from "@/middlewares/validation.middleware.js";

const router = Router();

router.post("/filter", validateBody(ProblemFilterSchema), getFilteredProblems);

router.get("/", getProblems);
router.get("/solution", getSolutions);

export default router;
