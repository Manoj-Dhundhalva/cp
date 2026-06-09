ALTER TABLE "problems" ALTER COLUMN "title" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "time_limit_unit" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "memory_limit_unit" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "problem_statement" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "input_specification" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "output_specification" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "note" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "input_test_case" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ALTER COLUMN "output_test_case" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "is_scraped" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "solved_count";