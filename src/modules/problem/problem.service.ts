import z from "zod";
import { WebScraperService } from "@/services/web-scraper.service.js";
import { DbService } from "@/services/db.service.js";
import { ContestIdSchema } from "@/schema/contest.schema.js";
import { utils } from "@/utils/index.js";
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
  editorialUrl: z.url(),
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

  public static getInstance(): ProblemService {
    if (!ProblemService.instance) {
      ProblemService.instance = new ProblemService(WebScraperService.getInstance(), DbService.getInstance());
    }
    return ProblemService.instance;
  }

  async init() {
    await this.scrapeProblemsInBatches();
  }

  private async getProblems(payload: TProblemPayload): Promise<void> {
    if (payload.problems.length === 0) return;

    const scrapeTasks = payload.problems.map((problem) => ({ url: getProblemUrl(problem) }));

    const { htmlPages } = await this.webScraper.scrape({ scrapeTasks });

    const problems = htmlPages.map((htmlPage) => parseProblemFromHtml(htmlPage));

    await Promise.all(
      problems.map((problem, i) => {
        if (!payload.problems[i] || !problem.problemStatement) return Promise.resolve();
        return this.dbService.updateProblem(payload.problems[i], problem);
      }),
    );
  }

  private async scrapeProblemsInBatches(batchSize = 25): Promise<void> {
    const problems = await this.dbService.getUnscrapedProblems();

    console.log(`Found ${problems.length} unscraped problems`);

    for (let i = 0; i < problems.length; i += batchSize) {
      const batch = problems.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(problems.length / batchSize);

      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} problems)`);

      await this.getProblems({ problems: batch });

      console.log(`Completed batch ${batchNumber}/${totalBatches}`);

      await utils.sleep(1000);
    }

    console.log("Problem scraping completed");
  }
}

export const problemService = ProblemService.getInstance();
