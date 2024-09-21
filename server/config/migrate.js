require('dotenv').config();
const { migrate } = require('drizzle-orm/postgres-js/migrator');  // Update to use PostgreSQL migrator
const { db, pool } = require('./db');

// Define an asynchronous function to run migrations
async function runMigrations() {
  try {
    // This will run migrations on the database, skipping the ones already applied
    await migrate(db, { migrationsFolder: './migrations' });

    // Close the connection pool
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Execute the migration function
runMigrations();




