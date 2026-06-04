CREATE TABLE "contests" (
	"contest_id" integer PRIMARY KEY NOT NULL,
	"contest_name" text NOT NULL,
	"writers" text[] NOT NULL,
	"start_time" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"problem_id" text NOT NULL,
	"contest_id" integer NOT NULL,
	"index" char(1) NOT NULL,
	"title" text NOT NULL,
	"time_limit" text NOT NULL,
	"memory_limit" text NOT NULL,
	"rating" integer NOT NULL,
	"statement" text NOT NULL,
	"input_specification" text NOT NULL,
	"output_specification" text NOT NULL,
	"note" text,
	"input_test_case" text NOT NULL,
	"output_test_case" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "problems_problem_id_contest_id_pk" PRIMARY KEY("problem_id","contest_id")
);
--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_contest_id_contests_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("contest_id") ON DELETE no action ON UPDATE no action;