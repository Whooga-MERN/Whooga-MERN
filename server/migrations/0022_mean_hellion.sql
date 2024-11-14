ALTER TABLE "collections" DROP CONSTRAINT "collections_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "collectionUniverses" DROP CONSTRAINT "collectionUniverses_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "notification_opt_in" SET DEFAULT false;