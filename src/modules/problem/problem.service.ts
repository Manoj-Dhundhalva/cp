import z from "zod";
import { webScraper, type WebScraperService } from "@/services/web-scraper.service.js";
import { dbService, type DbService } from "@/services/db.service.js";
import { ContestIdSchema } from "@/schema/contest.schema.js";
import { getProblemUrl, parseProblemFromHtml } from "./problem.helpers.js";

export const ParsedProblemSchema = z.object({
  title: z.string(),
  timeLimitValue: z.number().positive(),
  timeLimitUnit: z.string(),
  memoryLimitValue: z.number().positive(),
  memoryLimitUnit: z.string(),
  problemStatement: z.string(),
  inputSpecification: z.string(),
  outputSpecification: z.string(),
  inputTestCase: z.string(),
  outputTestCase: z.string(),
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

  private constructor(
    private readonly webScraper: WebScraperService,
    private readonly dbService: DbService,
  ) {}

  public static getInstance(webScraper: WebScraperService, dbService: DbService): ProblemService {
    if (!ProblemService.instance) {
      ProblemService.instance = new ProblemService(webScraper, dbService);
    }
    return ProblemService.instance;
  }

  private async getProblems(payload: TProblemPayload): Promise<void> {
    if (payload.problems.length === 0) return;

    const scrapeTasks = payload.problems.map((problem) => ({
      url: getProblemUrl(problem),
    }));

    const { htmlPages } = await this.webScraper.scrape({ scrapeTasks });

    const problems = htmlPages.map((htmlPage) => parseProblemFromHtml(htmlPage));

    // Background DB update
    problems.forEach((problem, i) => {
      if (!payload.problems[i] || !problem.problemStatement) return;
      this.dbService.updateProblem(payload.problems[i], problem);
    });
  }

  async getNewProblems(payload: TProblemPayload): Promise<void> {
    const problems = (
      await Promise.all(
        payload.problems.map(async (p) => {
          const isScraped = await this.dbService.isProblemScraped(p);
          return isScraped ? null : p;
        }),
      )
    ).filter((p) => p != null);

    this.getProblems({ problems });
  }
}

export const problemService = ProblemService.getInstance(webScraper, dbService);
