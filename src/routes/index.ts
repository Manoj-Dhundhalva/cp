import { Router } from "express";

import contestRoutes from "./contest.routes.js";
import problemRoutes from "./problem.routes.js";

const router = Router();

router.use("/contest", contestRoutes);
router.use("/problem", problemRoutes);

export default router;
