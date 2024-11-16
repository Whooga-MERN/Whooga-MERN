const { pgTable, serial, varchar, date, jsonb, boolean, text, integer, vector} = require("drizzle-orm/pg-core");

const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  cognito_id: varchar('cognito_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 255 }).notNull(),
  createdDate: date('created_date').notNull(),
  user_profile_pic: varchar('user_profile_pic', { length: 2048 }),
  notification_opt_in: boolean('notification_opt_in').default(false),
  accepted_terms: boolean('accepted_terms').default(false)
});

const collections = pgTable('collections', {
  collection_id: serial('collection_id').primaryKey().notNull(),
  user_id: integer('user_id').notNull(),
  collection_universe_id: integer('collection_universe_id').notNull().references(() => collectionUniverses.collection_universe_id, { onDelete: 'CASCADE' }),
  custom_attributes: jsonb('custom_attributes'),
  favorite_attributes: jsonb('favorite_attributes'),
  hidden_attributes: jsonb('hidden_attributes'),
  collection_pic: varchar('collection_pic', { length: 2048 })
});

const collectionUniverses = pgTable('collectionUniverses', {
  collection_universe_id: serial('collection_universe_id').primaryKey().notNull(),
  user_id: integer('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  default_attributes: jsonb('default_attributes').notNull(),
  universe_collection_pic: varchar('universe_collection_pic', { length: 2048 }),
  description: varchar('description', { length: 255 }),
  source_universe: integer('source_universe'),
  is_published: boolean('is_published').notNull()
});

const collectables = pgTable('collectables', {
  collectable_id: serial('collectable_id').primaryKey().notNull(),
  collection_id: integer('collection_id').notNull().references(() => collections.collection_id, { onDelete: 'CASCADE' }),
  universe_collectable_id: serial('universe_collectable_id').notNull().references(() => universeCollectables.universe_collectable_id, { onDelete: 'CASCADE' })
});

const universeCollectables = pgTable('universeCollectables', {
  universe_collectable_id: serial('universe_collectable_id').primaryKey().notNull(),
  collection_universe_id: integer('collection_universe_id').notNull().references(() => collectionUniverses.collection_universe_id, { onDelete: 'CASCADE' }),
  is_published: boolean('is_published').notNull()
});

const collectableAttributes = pgTable('collectableAttributes', {
  collectable_attribute_id: serial('collectable_attribute_id').primaryKey().notNull(),
  collection_id: integer('collection_id').references(() => collections.collection_id), // Optional foreign key
  collection_universe_id: integer('collection_universe_id').notNull().references(() => collectionUniverses.collection_universe_id, { onDelete: 'CASCADE' }),
  universe_collectable_id: integer('universe_collectable_id').notNull().references(() => universeCollectables.universe_collectable_id, { onDelete: 'CASCADE' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  is_custom: boolean('is_custom').notNull()
});

const scraped = pgTable('scraped', {
  id: serial('id').primaryKey().notNull(),
  collection_universe_id: integer('collection_universe_id').notNull().references(() => collectionUniverses.collection_universe_id, { onDelete: 'CASCADE' }),
  source_universe: integer('source_universe').notNull(),
  title: varchar('title', { length: 255 }),
  price: varchar('price', { length: 255 }),
  link: text('link'),
  image_url: text('image_url'),
  text_vector: vector('text_vector', { dimensions: 384 }), 
  image_vector: vector('image_vector', { dimensions: 512 }) 
});

const wishlist = pgTable('wishlist', {
  id: serial('id').primaryKey().notNull(),
  closest_match: integer('closest_match').references(() => scraped.id ),
  source_universe: serial('source_universe').notNull(),
  collection_universe_id: integer('collection_universe_id').notNull().references(() => collectionUniverses.collection_universe_id, { onDelete: 'CASCADE' }),
  universe_collectable_id: integer('universe_collectable_id').notNull().references(() => universeCollectables.universe_collectable_id, { onDelete: 'CASCADE' }),
  search_string: varchar('search_string', { length: 255 }).notNull(),
  text_vector: vector('text_vector', { dimensions: 384 }), 
  image_vector: vector('image_vector', { dimensions: 512 }) 
});

module.exports = {
  users, 
  collections,
  collectionUniverses,
  collectables,
  universeCollectables,
  collectableAttributes,
  scraped,
  wishlist
};
