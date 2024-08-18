CREATE TABLE IF NOT EXISTS "ktc_rankings" (
	"overall_ranking" serial PRIMARY KEY NOT NULL,
	"player" text NOT NULL,
	"value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ud_rankings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"adp" numeric NOT NULL,
	"projected_points" numeric NOT NULL,
	"position_rank" text NOT NULL,
	"slot_name" text NOT NULL,
	"team_name" text NOT NULL,
	"lineup_status" text DEFAULT '',
	"bye_week" text DEFAULT ''
);
