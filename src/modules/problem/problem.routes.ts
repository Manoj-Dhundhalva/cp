import { Router } from "express";
import {
  getContestProblems,
  getFilteredProblems,
  getProblem,
  getProblems,
  getSolutions,
} from "./problem.controller.js";
import { ContestSchema, ProblemFilterSchema, ProblemSchema } from "./problem.schema.js";
import { validateBody, validateParams } from "@/middlewares/validation.middleware.js";

const router = Router();

router.post("/filter", validateBody(ProblemFilterSchema), getFilteredProblems);

router.get("/solution", getSolutions);
router.get("/", getProblems);

router.get("/:contestId/:problemIndex", validateParams(ProblemSchema), getProblem);
router.get("/:contestId", validateParams(ContestSchema), getContestProblems);

export default router;
