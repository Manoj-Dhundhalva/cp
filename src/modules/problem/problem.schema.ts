import { z } from "zod";

export const ProblemSchema = z.object({
  contestId: z.coerce.number().int().min(1),
  problemIndex: z.string().min(1),
});

export const ContestSchema = z.object({
  contestId: z.coerce.number().int().min(1),
});

export const ProblemFilterSchema = z
  .object({
    tags: z.array(z.string()).optional().default([]),
    rating: z.tuple([z.number().int().min(0), z.number().int().min(0)]).optional(),
    startTime: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(),
    limit: z.number().int().min(1).max(1000).optional().default(5),
    sort: z
      .object({
        field: z.enum(["rating", "startTime", "contestId"]),
        order: z.enum(["asc", "desc"]),
      })
      .optional()
      .default({
        field: "contestId",
        order: "desc",
      }),
  })
  .transform((data) => {
    data.tags = [...data.tags].sort();

    if (data.rating?.length === 2) {
      const [a, b] = data.rating;
      data.rating = a > b ? [b, a] : [a, b];
    }

    if (data.startTime?.length === 2) {
      const [a, b] = data.startTime;
      data.startTime = a > b ? [b, a] : [a, b];
    }

    return data;
  });

export type TProblemFilterBody = z.infer<typeof ProblemFilterSchema>;
export type TProblemParams = z.infer<typeof ProblemSchema>;
export type TContestParams = z.infer<typeof ContestSchema>;
