import { pgTable, text, integer, timestamp, char, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const contests = pgTable("contests", {
  contestId: integer("contest_id").primaryKey(),
  contestName: text("contest_name").notNull(),
  writers: text("writers").array().notNull(),
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
    problemId: text("problem_id").notNull(),
    contestId: integer("contest_id")
      .notNull()
      .references(() => contests.contestId),
    index: char("index", { length: 1 }).notNull(),
    title: text("title").notNull(),
    timeLimit: text("time_limit").notNull(),
    memoryLimit: text("memory_limit").notNull(),
    rating: integer("rating").notNull(),
    statement: text("statement").notNull(),
    inputSpecification: text("input_specification").notNull(),
    outputSpecification: text("output_specification").notNull(),
    note: text("note"),
    inputTestCase: text("input_test_case").notNull(),
    outputTestCase: text("output_test_case").notNull(),
    tags: text("tags").array().notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.problemId, table.contestId] })],
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
