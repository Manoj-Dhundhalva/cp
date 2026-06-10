CREATE TABLE "contests" (
	"contest_id" integer PRIMARY KEY NOT NULL,
	"contest_name" text DEFAULT '',
	"type" text DEFAULT '',
	"start_time" integer NOT NULL,
	"duration" integer NOT NULL,
	"editorial_url" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"contest_id" integer NOT NULL,
	"problem_index" text NOT NULL,
	"title" text DEFAULT '',
	"rating" integer,
	"time_limit_value" real,
	"time_limit_unit" text DEFAULT '',
	"memory_limit_value" integer,
	"memory_limit_unit" text DEFAULT '',
	"problem_statement" text DEFAULT '',
	"input_specification" text DEFAULT '',
	"output_specification" text DEFAULT '',
	"note" text DEFAULT '',
	"input_test_case" text DEFAULT '',
	"output_test_case" text DEFAULT '',
	"tags" text[] DEFAULT '{}' NOT NULL,
	"is_scraped" boolean DEFAULT false NOT NULL,
	"solutions" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "problems_problem_index_contest_id_pk" PRIMARY KEY("problem_index","contest_id")
);
--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_contest_id_contests_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("contest_id") ON DELETE no action ON UPDATE no action;