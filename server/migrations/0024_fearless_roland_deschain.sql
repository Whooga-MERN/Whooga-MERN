ALTER TABLE "scraped" ALTER COLUMN "image_vector" SET DATA TYPE vector(512);--> statement-breakpoint
ALTER TABLE "wishlist" ALTER COLUMN "image_vector" SET DATA TYPE vector(512);