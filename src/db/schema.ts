import { mysqlTable, text, varchar, int, timestamp, primaryKey, double, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const contests = mysqlTable("contests", {
  contestId: int("contest_id").primaryKey(),
  contestName: text("contest_name").default(""),
  type: text("type").default(""),
  startTime: int("start_time").notNull(),
  duration: int("duration").notNull(),
  editorialUrl: text("editorial_url").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const problems = mysqlTable(
  "problems",
  {
    contestId: int("contest_id")
      .notNull()
      .references(() => contests.contestId),
    problemIndex: varchar("problem_index", { length: 4 }).notNull(),
    title: text("title").default(""),
    rating: int("rating"),

    timeLimitValue: double("time_limit_value"),
    timeLimitUnit: text("time_limit_unit").default(""),

    memoryLimitValue: int("memory_limit_value"),
    memoryLimitUnit: text("memory_limit_unit").default(""),

    problemStatement: text("problem_statement").default(""),

    inputSpecification: text("input_specification").default(""),
    outputSpecification: text("output_specification").default(""),

    note: text("note").default(""),

    inputTestCase: text("input_test_case").default(""),
    outputTestCase: text("output_test_case").default(""),

    tags: json("tags").$type<string[]>().notNull().default([]),

    isScraped: boolean("is_scraped").notNull().default(false),

    solutions: json("solutions").$type<string[]>().notNull().default([]),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.problemIndex, table.contestId] })],
);

// Relations
export const contestsRelations = relations(contests, ({ many }) => ({
  problems: many(problems),
}));

export const problemsRelations = relations(problems, ({ one }) => ({
  contest: one(contests, {
    fields: [problems.contestId],
    references: [contests.contestId],
  }),
}));
