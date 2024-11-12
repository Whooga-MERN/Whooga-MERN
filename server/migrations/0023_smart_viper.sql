ALTER TABLE "scraped" ALTER COLUMN "text_vector" SET DATA TYPE vector(384);--> statement-breakpoint
ALTER TABLE "wishlist" ALTER COLUMN "text_vector" SET DATA TYPE vector(384);