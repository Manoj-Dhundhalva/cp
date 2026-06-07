import { ContestIdSchema } from "@/schema/contest.schema.js";
import { z } from "zod";

export const ProblemSchema = z.object({
  problems: z
    .array(
      z.object({
        contestId: ContestIdSchema,
        problemIndex: z.string(),
      }),
    )
    .min(1),
});

export type TProblemBody = z.infer<typeof ProblemSchema>;
