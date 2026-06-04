import express from "express";
import cors from "cors";

import router from "@/routes/index.js";
import { errorHandler } from "@/middlewares/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(errorHandler);

export default app;
