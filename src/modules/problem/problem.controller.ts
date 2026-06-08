import type { Request, Response, NextFunction } from "express";
import type { TProblemFilterBody } from "./problem.schema.js";
import { problemService } from "./problem.service.js";
import { dbService } from "@/services/db.service.js";

export async function getFilteredProblems(
  req: Request<object, unknown, TProblemFilterBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await dbService.getProblemsByFilter(req.body);
    res.status(200).json(data);

    // Background DB update
    problemService.getNewProblems({ problems: data });
  } catch (error) {
    next(error);
  }
}
