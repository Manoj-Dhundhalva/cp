import { z } from "zod";

export const ProblemSchema = z.object({
  problems: z
    .array(
      z.object({
        contestId: z.number(),
        problemIndex: z.string(),
      }),
    )
    .min(1),
});

export type TProblemBody = z.infer<typeof ProblemSchema>;
