CREATE TABLE "user_metadata_to_notes" (
	"user_id" text NOT NULL,
	"file_id" varchar NOT NULL,
	"saved" boolean DEFAULT true NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_metadata_to_notes_user_id_file_id_pk" PRIMARY KEY("user_id","file_id")
);
--> statement-breakpoint
ALTER TABLE "user_metadata_to_notes" ADD CONSTRAINT "user_metadata_to_notes_user_id_user_metadata_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_metadata_to_notes" ADD CONSTRAINT "user_metadata_to_notes_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;