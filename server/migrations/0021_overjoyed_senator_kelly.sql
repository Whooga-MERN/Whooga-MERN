ALTER TABLE "scraped" ADD COLUMN "text_vector" vector(768);--> statement-breakpoint
ALTER TABLE "scraped" ADD COLUMN "image_vector" vector(512);--> statement-breakpoint
ALTER TABLE "wishlist" ADD COLUMN "closest_match" integer;--> statement-breakpoint
ALTER TABLE "wishlist" ADD COLUMN "text_vector" vector(768);--> statement-breakpoint
ALTER TABLE "wishlist" ADD COLUMN "image_vector" vector(512);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_closest_match_scraped_id_fk" FOREIGN KEY ("closest_match") REFERENCES "public"."scraped"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
