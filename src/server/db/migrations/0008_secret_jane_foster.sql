-- define enum types for file moderation and report statuses
CREATE TYPE "public"."moderation_status" AS ENUM('VISIBLE', 'HIDDEN', 'AUTO_HIDDEN');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('PENDING', 'DISMISSED', 'FILE_HIDDEN', 'FILE_DELETED');--> statement-breakpoint

-- add moderation status (visibility) column to file table. all files are visible by default.
ALTER TABLE "file" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'VISIBLE' NOT NULL;--> statement-breakpoint

-- add filename column to existing reports, filling it with the reports' associated file names
ALTER TABLE "report" ADD COLUMN "file_name" text;--> statement-breakpoint
UPDATE "report" SET "file_name" = "file"."name" FROM "file" WHERE "report"."file_id" = "file"."id";
ALTER TABLE "report" ALTER COLUMN "file_name" SET NOT NULL;

-- add status column to all existing reports; all are pending by default
ALTER TABLE "report" ADD COLUMN "status" "report_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint

-- add reviewer metadata
ALTER TABLE "report" ADD COLUMN "reviewer_id" text;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint

-- reviewer id references a row in the userMetadata table
ALTER TABLE "report" ADD CONSTRAINT "report_reviewer_id_user_metadata_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user_metadata"("id") ON DELETE no action ON UPDATE no action;