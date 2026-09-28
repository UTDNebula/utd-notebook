-- Keep the duplicate check, normalization, and index replacement atomic.
DO $$
BEGIN
  LOCK TABLE "user_metadata" IN ACCESS EXCLUSIVE MODE;

  IF EXISTS (
    SELECT lower("username")
    FROM "user_metadata"
    WHERE "username" IS NOT NULL
    GROUP BY lower("username")
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Case-insensitive username duplicates exist. Resolve conflicting usernames before rerunning this migration.';
  END IF;

  UPDATE "user_metadata"
  SET "username" = lower("username")
  WHERE "username" <> lower("username");

  DROP INDEX "user_metadata_username_unique_idx";
  CREATE UNIQUE INDEX "user_metadata_username_unique_idx"
    ON "user_metadata" USING btree (lower("username"));
END
$$;
