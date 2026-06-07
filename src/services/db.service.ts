import { db } from "@/db/connection.js";
import { contests, problems } from "@/db/schema.js";
import { and, eq } from "drizzle-orm";
import { codeforces, type CodeforcesService } from "./codeforces.service.js";

export class DbService {
  private static instance: DbService;

  private constructor(private readonly codeforces: CodeforcesService) {}

  public static getInstance(codeforces: CodeforcesService): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService(codeforces);
    }
    return DbService.instance;
  }

  async insertContestsWithConflictIgnore(): Promise<void> {
    try {
      const { result } = await this.codeforces.getContests();

      await db
        .insert(contests)
        .values(
          result.map((contest) => ({
            contestId: contest.id,
            contestName: contest.name,
            type: contest.type,
            startTime: new Date(contest.startTimeSeconds * 1000),
            duration: contest.durationSeconds,
          })),
        )
        .onConflictDoNothing({
          target: contests.contestId,
        });
    } catch (error) {
      throw new Error(`DB insertContestsWithConflictIgnore failed: ${String(error)}`, { cause: error });
    }
  }

  async insertProblemsWithConflictIgnore(): Promise<void> {
    try {
      const { result } = await this.codeforces.getProblems();

      // Insert problems (ignore duplicates)
      await db
        .insert(problems)
        .values(
          result.problems.map((p) => ({
            contestId: p.contestId,
            problemIndex: p.index,
            title: p.name,
            rating: p.rating,
            tags: p.tags,
          })),
        )
        .onConflictDoNothing({
          target: [problems.contestId, problems.problemIndex],
        });

      // Batch update solvedCount
      await db.transaction(async (tx) => {
        for (const item of result.problemStatistics) {
          await tx
            .update(problems)
            .set({ solvedCount: item.solvedCount })
            .where(and(eq(problems.contestId, item.contestId), eq(problems.problemIndex, item.index)));
        }
      });
    } catch (error) {
      throw new Error(`DB insertProblemsWithConflictIgnore failed: ${String(error)}`, { cause: error });
    }
  }
}

export const dbService = DbService.getInstance(codeforces);
