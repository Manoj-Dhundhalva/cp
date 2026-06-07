import { pgTable, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const contests = pgTable("contests", {
  contestId: integer("contest_id").primaryKey(),
  contestName: text("contest_name").notNull(),
  type: text("type").notNull(),
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const problems = pgTable(
  "problems",
  {
    contestId: integer("contest_id")
      .notNull()
      .references(() => contests.contestId),
    problemIndex: text("problem_index").notNull(),
    title: text("title").notNull(),
    rating: integer("rating").notNull(),

    timeLimitValue: integer("time_limit_value"),
    timeLimitUnit: text("time_limit_unit"),

    memoryLimitValue: integer("memory_limit_value"),
    memoryLimitUnit: text("memory_limit_unit"),

    problemStatement: text("problem_statement"),

    inputSpecification: text("input_specification"),
    outputSpecification: text("output_specification"),

    note: text("note"),

    inputTestCase: text("input_test_case"),
    outputTestCase: text("output_test_case"),

    tags: text("tags").array().notNull().default([]),

    solvedCount: integer("solved_count").default(0),

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
