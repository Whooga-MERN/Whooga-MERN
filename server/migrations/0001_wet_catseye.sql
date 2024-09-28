ALTER TABLE "users" ADD COLUMN "userProfilePic" varchar(2048);--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "collectionPic" varchar(2048);--> statement-breakpoint
ALTER TABLE "collectionUniverses" ADD COLUMN "universeCollectionPic" varchar(2048);--> statement-breakpoint
ALTER TABLE "collectables" ADD COLUMN "collectablePic" varchar(2048);--> statement-breakpoint
ALTER TABLE "universeCollectables" ADD COLUMN "universeCollectablePic" varchar(2048);