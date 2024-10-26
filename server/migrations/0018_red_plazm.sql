ALTER TABLE "collectionUniverses" ALTER COLUMN "source_universe" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scraped" ALTER COLUMN "source_universe" SET NOT NULL;