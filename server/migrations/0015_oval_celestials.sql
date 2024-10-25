ALTER TABLE "scraped" RENAME COLUMN "collection_id" TO "source_universe";--> statement-breakpoint
ALTER TABLE "wishlist" RENAME COLUMN "collection_id" TO "source_universe";--> statement-breakpoint
ALTER TABLE "collectionUniverses" ADD COLUMN "source_universe" int NOT NULL;--> statement-breakpoint
ALTER TABLE "collectionUniverses" ADD COLUMN "is_published" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "universeCollectables" ADD COLUMN "is_published" boolean NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections" ADD CONSTRAINT "collections_collection_universe_id_collectionUniverses_collection_universe_id_fk" FOREIGN KEY ("collection_universe_id") REFERENCES "public"."collectionUniverses"("collection_universe_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectionUniverses" ADD CONSTRAINT "collectionUniverses_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectables" ADD CONSTRAINT "collectables_collection_id_collections_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("collection_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectables" ADD CONSTRAINT "collectables_universe_collectable_id_universeCollectables_universe_collectable_id_fk" FOREIGN KEY ("universe_collectable_id") REFERENCES "public"."universeCollectables"("universe_collectable_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "universeCollectables" ADD CONSTRAINT "universeCollectables_collection_universe_id_collectionUniverses_collection_universe_id_fk" FOREIGN KEY ("collection_universe_id") REFERENCES "public"."collectionUniverses"("collection_universe_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectableAttributes" ADD CONSTRAINT "collectableAttributes_collection_id_collections_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("collection_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectableAttributes" ADD CONSTRAINT "collectableAttributes_universe_collectable_id_universeCollectables_universe_collectable_id_fk" FOREIGN KEY ("universe_collectable_id") REFERENCES "public"."universeCollectables"("universe_collectable_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scraped" ADD CONSTRAINT "scraped_collection_universe_id_collectionUniverses_collection_universe_id_fk" FOREIGN KEY ("collection_universe_id") REFERENCES "public"."collectionUniverses"("collection_universe_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_collection_universe_id_collectionUniverses_collection_universe_id_fk" FOREIGN KEY ("collection_universe_id") REFERENCES "public"."collectionUniverses"("collection_universe_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_universe_collectable_id_universeCollectables_universe_collectable_id_fk" FOREIGN KEY ("universe_collectable_id") REFERENCES "public"."universeCollectables"("universe_collectable_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "collectableAttributes" DROP COLUMN IF EXISTS "collectable_id";