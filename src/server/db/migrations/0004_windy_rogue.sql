ALTER TABLE "user_metadata" ADD COLUMN "username" text;--> statement-breakpoint
CREATE UNIQUE INDEX "user_metadata_username_unique_idx" ON "user_metadata" USING btree ("username");