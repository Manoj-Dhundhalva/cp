import axios, { type AxiosInstance } from "axios";
import z from "zod";
import { ContestIdSchema } from "@/schema/contest.schema.js";
import { handleServiceApiError } from "./helpers/index.js";

export const ContestSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: z.string(),
  phase: z.enum(["BEFORE", "FINISHED"]),
  frozen: z.boolean(),
  durationSeconds: z.number().int(),
  startTimeSeconds: z.number().int(),
  relativeTimeSeconds: z.number().int(),
});

export const ContestListResponseSchema = z.object({
  status: z.literal("OK"),
  result: z.array(ContestSchema),
});

export type TContest = z.infer<typeof ContestSchema>;
export type TContestListResponse = z.infer<typeof ContestListResponseSchema>;

export const ProblemSchema = z.object({
  contestId: ContestIdSchema,
  index: z.string(),
  name: z.string(),
  type: z.string(),
  points: z.number().optional(),
  rating: z.number().int().min(800).optional(),
  tags: z.array(z.string()),
});

export const ProblemStatisticSchema = z.object({
  contestId: ContestIdSchema,
  index: z.string(),
  solvedCount: z.number().int().min(0),
});

export const ProblemsetProblemsResponseSchema = z.object({
  status: z.literal("OK"),
  result: z.object({
    problems: z.array(ProblemSchema),
    problemStatistics: z.array(ProblemStatisticSchema),
  }),
});

export type TProblem = z.infer<typeof ProblemSchema>;
export type TProblemStatistic = z.infer<typeof ProblemStatisticSchema>;
export type TProblemsetProblemsResponse = z.infer<typeof ProblemsetProblemsResponseSchema>;

export class CodeforcesService {
  private static instance: CodeforcesService;

  private client: AxiosInstance;

  private readonly BASE_URL = "https://codeforces.com/api" as const;

  private readonly CONTEST_LIST_ENDPOINT = "/contest.list" as const;
  private readonly PROBLEMSET_PROBLEMS_ENDPOINT = "/problemset.problems" as const;

  private constructor() {
    this.client = axios.create({
      baseURL: this.BASE_URL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public static getInstance(): CodeforcesService {
    if (!CodeforcesService.instance) {
      CodeforcesService.instance = new CodeforcesService();
    }

    return CodeforcesService.instance;
  }

  async getContests(): Promise<TContestListResponse> {
    try {
      const res = await this.client.get(this.CONTEST_LIST_ENDPOINT);
      const parsed = ContestListResponseSchema.parse(res.data);
      return parsed;
    } catch (error) {
      handleServiceApiError("Codeforces", error);
    }
  }

  async getProblems(): Promise<TProblemsetProblemsResponse> {
    try {
      const res = await this.client.get(this.PROBLEMSET_PROBLEMS_ENDPOINT);
      const parsed = ProblemsetProblemsResponseSchema.parse(res.data);
      return parsed;
    } catch (error) {
      handleServiceApiError("Codeforces", error);
    }
  }
}

export const codeforces = CodeforcesService.getInstance();
