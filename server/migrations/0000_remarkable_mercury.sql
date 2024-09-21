CREATE TABLE IF NOT EXISTS "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"cognito_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(255) NOT NULL,
	"created_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"collection_id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"collection_universe_id" serial NOT NULL,
	"custom_attributes" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collectionUniverses" (
	"collection_universe_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"default_attributes" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collectables" (
	"collectable_id" serial PRIMARY KEY NOT NULL,
	"collection_id" serial NOT NULL,
	"universe_collectable_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "universeCollectables" (
	"universe_collectable_id" serial PRIMARY KEY NOT NULL,
	"collection_universe_id" serial NOT NULL,
	"collectable_type" varchar(255) NOT NULL,
	"type_id" serial NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collectableAttributes" (
	"collectable_attribute_id" serial PRIMARY KEY NOT NULL,
	"collection_id" serial NOT NULL,
	"collectable_id" serial NOT NULL,
	"universe_collectable_id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"is_custom" boolean NOT NULL
);
