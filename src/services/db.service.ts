import { db } from "@/db/connection.js";
import { contests, problems } from "@/db/schema.js";
import { and, arrayOverlaps, asc, desc, eq, gte, lte } from "drizzle-orm";
import { codeforces, type CodeforcesService } from "./codeforces.service.js";
import type { TProblemFilterBody } from "@/modules/problem/problem.schema.js";
import type { TParsedProblem, TProblemIdentifier } from "@/modules/problem/problem.service.js";

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
            startTime: contest.startTimeSeconds,
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

      // // Batch update solvedCount
      // await db.transaction(async (tx) => {
      //   for (const item of result.problemStatistics) {
      //     await tx
      //       .update(problems)
      //       .set({ solvedCount: item.solvedCount })
      //       .where(and(eq(problems.contestId, item.contestId), eq(problems.problemIndex, item.index)));
      //   }
      // });
    } catch (error) {
      throw new Error(`DB insertProblemsWithConflictIgnore failed: ${String(error)}`, { cause: error });
    }
  }

  async getProblemsByFilter(payload: TProblemFilterBody) {
    try {
      const { tags, rating, startTime, limit, sort } = payload;

      const conditions = [];

      if (tags?.length > 0) {
        conditions.push(arrayOverlaps(problems.tags, tags));
      }

      if (rating?.length === 2) {
        const [minRating, maxRating] = rating;
        conditions.push(gte(problems.rating, minRating));
        conditions.push(lte(problems.rating, maxRating));
      }

      if (startTime?.length === 2) {
        const [from, to] = startTime;

        conditions.push(gte(contests.startTime, from));
        conditions.push(lte(contests.startTime, to));
      }

      let orderBy;

      switch (sort.field) {
        case "rating":
          orderBy = sort.order === "asc" ? asc(problems.rating) : desc(problems.rating);
          break;

        case "startTime":
          orderBy = sort.order === "asc" ? asc(contests.startTime) : desc(contests.startTime);
          break;

        case "contestId":
        default:
          orderBy = sort.order === "asc" ? asc(contests.contestId) : desc(contests.contestId);
          break;
      }

      const result = await db
        .select({
          contestId: contests.contestId,
          contestName: contests.contestName,
          startTime: contests.startTime,
          type: contests.type,

          problemIndex: problems.problemIndex,
          title: problems.title,
          rating: problems.rating,
          tags: problems.tags,

          timeLimitValue: problems.timeLimitValue,
          timeLimitUnit: problems.timeLimitUnit,

          memoryLimitValue: problems.memoryLimitValue,
          memoryLimitUnit: problems.memoryLimitUnit,

          problemStatement: problems.problemStatement,

          inputSpecification: problems.inputSpecification,
          outputSpecification: problems.outputSpecification,

          inputTestCase: problems.inputTestCase,
          outputTestCase: problems.outputTestCase,

          note: problems.note,
          solvedCount: problems.solvedCount,
        })
        .from(problems)
        .innerJoin(contests, eq(problems.contestId, contests.contestId))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(orderBy)
        .limit(limit);

      return result;
    } catch (error) {
      throw new Error(`DB getProblemsByFilter failed: ${String(error)}`, { cause: error });
    }
  }

  async updateProblem(payload: TProblemIdentifier, problem: TParsedProblem) {
    try {
      await db
        .update(problems)
        .set({
          timeLimitValue: problem.timeLimitValue,
          timeLimitUnit: problem.timeLimitUnit,

          memoryLimitValue: problem.memoryLimitValue,
          memoryLimitUnit: problem.memoryLimitUnit,

          problemStatement: problem.problemStatement,

          inputSpecification: problem.inputSpecification,
          outputSpecification: problem.outputSpecification,

          note: problem.note,

          inputTestCase: problem.inputTestCase,
          outputTestCase: problem.outputTestCase,
        })
        .where(and(eq(problems.contestId, payload.contestId), eq(problems.problemIndex, payload.problemIndex)));
    } catch (error) {
      throw new Error(`DB updateProblem failed: ${String(error)}`, { cause: error });
    }
  }

  async isProblemScraped(payload: TProblemIdentifier): Promise<boolean> {
    try {
      const result = await db
        .select({ problemStatement: problems.problemStatement })
        .from(problems)
        .where(and(eq(problems.contestId, payload.contestId), eq(problems.problemIndex, payload.problemIndex)))
        .limit(1);

      return Boolean(result[0]?.problemStatement);
    } catch (error) {
      throw new Error(`DB getProblemStatement failed: ${String(error)}`, { cause: error });
    }
  }
}

export const dbService = DbService.getInstance(codeforces);
