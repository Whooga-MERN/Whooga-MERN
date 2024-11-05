ALTER TABLE "collections" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "collection_universe_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "collectionUniverses" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "collectionUniverses" ALTER COLUMN "source_universe" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "collectables" ALTER COLUMN "collection_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "universeCollectables" ALTER COLUMN "collection_universe_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "collectableAttributes" ALTER COLUMN "collection_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "collectableAttributes" ALTER COLUMN "collection_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "collectableAttributes" ALTER COLUMN "universe_collectable_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "scraped" ALTER COLUMN "source_universe" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "scraped" ALTER COLUMN "collection_universe_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "wishlist" ALTER COLUMN "collection_universe_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "wishlist" ALTER COLUMN "universe_collectable_id" SET DATA TYPE integer;