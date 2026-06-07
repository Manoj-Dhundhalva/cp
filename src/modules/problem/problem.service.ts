import z from "zod";
import { webScraper, type WebScraperService } from "@/services/web-scraper.service.js";
import { ContestIdSchema } from "@/schema/contest.schema.js";
import { getProblemUrl, parseProblemFromHtml } from "./problem.helpers.js";

export const ProblemLimitSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.string(),
});

export const ParsedProblemSchema = z.object({
  title: z.string(),
  timeLimit: ProblemLimitSchema,
  memoryLimit: ProblemLimitSchema,
  problemStatement: z.string(),
  specification: z.object({
    input: z.string(),
    output: z.string(),
  }),
  testCase: z.object({
    input: z.string(),
    output: z.string(),
  }),
  rating: z.number().int().min(800).optional(),
  tags: z.array(z.string()),
  note: z.string(),
});

export const ProblemIdentifierSchema = z
  .object({
    contestId: ContestIdSchema,
    problemIndex: z.string().min(1),
  })
  .strict();

export const ProblemPayloadSchema = z
  .object({
    problems: z.array(ProblemIdentifierSchema).min(1),
  })
  .strict();

export const ProblemResponseSchema = z
  .object({
    problems: z.array(ParsedProblemSchema),
  })
  .strict();

export type TProblemIdentifier = z.infer<typeof ProblemIdentifierSchema>;
export type TProblemPayload = z.infer<typeof ProblemPayloadSchema>;
export type TParsedProblem = z.infer<typeof ParsedProblemSchema>;
export type TProblemResponse = z.infer<typeof ProblemResponseSchema>;

export class ProblemService {
  private static instance: ProblemService;

  private constructor(private readonly webScraper: WebScraperService) {}

  public static getInstance(webScraper: WebScraperService): ProblemService {
    if (!ProblemService.instance) {
      ProblemService.instance = new ProblemService(webScraper);
    }
    return ProblemService.instance;
  }

  async getProblems(payload: TProblemPayload): Promise<TProblemResponse> {
    const scrapeTasks = payload.problems.map((problem) => ({
      url: getProblemUrl(problem),
    }));

    const { htmlPages } = await this.webScraper.scrape({ scrapeTasks });

    const problems = htmlPages.map((htmlPage) => parseProblemFromHtml(htmlPage));

    return { problems };
  }
}

export const problemService = ProblemService.getInstance(webScraper);
