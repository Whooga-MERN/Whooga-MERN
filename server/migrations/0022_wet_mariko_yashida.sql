ALTER TABLE "scraped" ALTER COLUMN "image_vector" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "wishlist" ALTER COLUMN "image_vector" SET DATA TYPE vector(768);