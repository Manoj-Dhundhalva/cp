ALTER TABLE "problems" RENAME COLUMN "index" TO "problem_index";--> statement-breakpoint
ALTER TABLE "problems" RENAME COLUMN "statement" TO "problem_statement";--> statement-breakpoint
ALTER TABLE "problems" DROP CONSTRAINT "problems_problem_id_contest_id_pk";--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "input_specification" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "output_specification" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "input_test_case" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "output_test_case" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_problem_index_contest_id_pk" PRIMARY KEY("problem_index","contest_id");--> statement-breakpoint
ALTER TABLE "contests" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "time_limit_value" integer;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "time_limit_unit" text;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "memory_limit_value" integer;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "memory_limit_unit" text;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "solved_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "contests" DROP COLUMN "writers";--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "problem_id";--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "time_limit";--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "memory_limit";