ALTER TABLE "collections" ADD COLUMN "favorite_attributes" jsonb;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "hidden_attributes" jsonb;--> statement-breakpoint
ALTER TABLE "collectables" ADD COLUMN "isWishlist" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "universeCollectables" DROP COLUMN IF EXISTS "name";