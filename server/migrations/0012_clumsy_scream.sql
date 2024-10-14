CREATE TABLE IF NOT EXISTS "wishlit" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" serial NOT NULL,
	"collection_universe_id" serial NOT NULL,
	"universe_collectable_id" serial NOT NULL
);
