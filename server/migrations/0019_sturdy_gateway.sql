ALTER TABLE "collectableAttributes" ADD COLUMN "collection_universe_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectableAttributes" ADD CONSTRAINT "collectableAttributes_collection_universe_id_collectionUniverses_collection_universe_id_fk" FOREIGN KEY ("collection_universe_id") REFERENCES "public"."collectionUniverses"("collection_universe_id") ON DELETE CASCADE ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
