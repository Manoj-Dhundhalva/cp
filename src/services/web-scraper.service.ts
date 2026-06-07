import env from "@/config/env.js";
import axios, { type AxiosInstance } from "axios";
import z, { ZodError } from "zod";

export const ScrapeTaskSchema = z.object({
  url: z.url(),
  timeout: z.number().int().positive().optional(),
});

export const ScrapePayloadSchema = z
  .object({
    scrapeTasks: z.array(ScrapeTaskSchema),
  })
  .strict();

export const ScrapeResponseSchema = z.object({
  htmlPages: z.array(z.string()),
});

export type TScrapeTask = z.infer<typeof ScrapeTaskSchema>;
export type TScrapePayload = z.infer<typeof ScrapePayloadSchema>;
export type TScrapeResponse = z.infer<typeof ScrapeResponseSchema>;

export class WebScraperService {
  private static instance: WebScraperService;

  private client: AxiosInstance;

  private readonly SCRAPE_ENDPOINT = "/api/scrape" as const;

  private constructor() {
    this.client = axios.create({
      baseURL: env.WEB_SCRAPER_API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public static getInstance(): WebScraperService {
    if (!WebScraperService.instance) {
      WebScraperService.instance = new WebScraperService();
    }

    return WebScraperService.instance;
  }

  async scrape(payload: TScrapePayload): Promise<TScrapeResponse> {
    try {
      const res = await this.client.post(this.SCRAPE_ENDPOINT, payload);
      const parsed = ScrapeResponseSchema.parse(res.data);
      return parsed;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data || error.message || "Unknown Axios error";
        throw new Error(`WebScraper API error: ${message}`, { cause: error });
      }

      if (error instanceof ZodError) {
        throw new Error(
          `WebScraper API returned invalid response format: ${error.issues.map((i) => i.message).join(", ")}`,
          { cause: error },
        );
      }

      if (error instanceof Error) {
        throw new Error(`WebScraper API error: ${error.message}`, { cause: error });
      }

      throw new Error("WebScraper API error: Unknown error", { cause: error });
    }
  }
}

export const webScraper = WebScraperService.getInstance();
