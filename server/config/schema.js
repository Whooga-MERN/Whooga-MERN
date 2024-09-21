const { pgTable, serial, varchar, date, jsonb, boolean, } = require("drizzle-orm/pg-core");

const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  cognito_id: varchar('cognito_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 255 }).notNull(),
  createdDate: date('created_date').notNull(),
});

const collections = pgTable('collections', {
  collection_id: serial('collection_id').primaryKey().notNull(),
  user_id: serial('user_id').notNull(),
  collection_universe_id: serial('collection_universe_id').notNull(),
  custom_attributes: jsonb('custom_attributes')
});

const collectionUniverses = pgTable('collectionUniverses', {
  collection_universe_id: serial('collection_universe_id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  created_by: varchar('created_by', { length: 255 }).notNull(),
  default_attributes: jsonb('default_attributes').notNull()
});

const collectables = pgTable('collectables', {
  collectable_id: serial('collectable_id').primaryKey().notNull(),
  collection_id: serial('collection_id').notNull(),
  universe_collectable_id: serial('universe_collectable_id').notNull()
});

const universeCollectables = pgTable('universeCollectables', {
  universe_collectable_id: serial('universe_collectable_id').primaryKey().notNull(),
  collection_universe_id: serial('collection_universe_id').notNull(),
  collectable_type: varchar('collectable_type', { length: 255 }).notNull(),
  type_id: serial('type_id').notNull(),
  name: varchar('name', { length: 255 }).notNull()
});

const collectableAttributes = pgTable('collectableAttributes', {
  collectable_attribute_id: serial('collectable_attribute_id').primaryKey().notNull(),
  collection_id: serial('collection_id').notNull(),
  collectable_id: serial('collectable_id').notNull(),
  universe_collectable_id: serial('universe_collectable_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  is_custom: boolean('is_custom').notNull()
});

module.exports = {
  users, 
  collections,
  collectionUniverses,
  collectables,
  universeCollectables,
  collectableAttributes,
};
