CREATE TABLE IF NOT EXISTS "scraped" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" serial NOT NULL,
	"collection_universe_id" serial NOT NULL,
	"title" varchar(255),
	"price" varchar(255),
	"link" text,
	"image_url" text
);
