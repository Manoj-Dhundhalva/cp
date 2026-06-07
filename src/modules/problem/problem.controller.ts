import type { Request, Response, NextFunction } from "express";
import type { TProblemBody } from "./problem.schema.js";
import { problemService } from "./problem.service.js";

export async function getProblems(req: Request<object, unknown, TProblemBody>, res: Response, next: NextFunction) {
  try {
    const data = await problemService.getProblems(req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}
