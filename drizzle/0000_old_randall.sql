CREATE TABLE "contests" (
	"contest_id" integer PRIMARY KEY NOT NULL,
	"contest_name" text NOT NULL,
	"type" text NOT NULL,
	"start_time" integer NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"contest_id" integer NOT NULL,
	"problem_index" text NOT NULL,
	"title" text NOT NULL,
	"rating" integer,
	"time_limit_value" real,
	"time_limit_unit" text,
	"memory_limit_value" integer,
	"memory_limit_unit" text,
	"problem_statement" text,
	"input_specification" text,
	"output_specification" text,
	"note" text,
	"input_test_case" text,
	"output_test_case" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"solved_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "problems_problem_index_contest_id_pk" PRIMARY KEY("problem_index","contest_id")
);
--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_contest_id_contests_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("contest_id") ON DELETE no action ON UPDATE no action;