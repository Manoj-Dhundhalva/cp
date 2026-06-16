CREATE TABLE `contests` (
	`contest_id` int NOT NULL,
	`contest_name` text DEFAULT (''),
	`type` text DEFAULT (''),
	`start_time` int NOT NULL,
	`duration` int NOT NULL,
	`editorial_url` text DEFAULT (''),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contests_contest_id` PRIMARY KEY(`contest_id`)
);
--> statement-breakpoint
CREATE TABLE `problems` (
	`contest_id` int NOT NULL,
	`problem_index` varchar(4) NOT NULL,
	`title` text DEFAULT (''),
	`rating` int,
	`time_limit_value` double,
	`time_limit_unit` text DEFAULT (''),
	`memory_limit_value` int,
	`memory_limit_unit` text DEFAULT (''),
	`problem_statement` text DEFAULT (''),
	`input_specification` text DEFAULT (''),
	`output_specification` text DEFAULT (''),
	`note` text DEFAULT (''),
	`input_test_case` text DEFAULT (''),
	`output_test_case` text DEFAULT (''),
	`tags` json NOT NULL DEFAULT ('[]'),
	`is_scraped` boolean NOT NULL DEFAULT false,
	`solutions` json NOT NULL DEFAULT ('[]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `problems_problem_index_contest_id_pk` PRIMARY KEY(`problem_index`,`contest_id`)
);
--> statement-breakpoint
ALTER TABLE `problems` ADD CONSTRAINT `problems_contest_id_contests_contest_id_fk` FOREIGN KEY (`contest_id`) REFERENCES `contests`(`contest_id`) ON DELETE no action ON UPDATE no action;