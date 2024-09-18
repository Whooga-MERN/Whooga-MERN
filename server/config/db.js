require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');  // Import the pg package
const schema = require('./schema');    // Import the schema

console.log('Database User:', process.env.DB_USER); // For debugging purposes

// Create a connection pool to the PostgreSQL database
const pool = postgres({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
  {
    rejectUnauthorized: false,
  }
});

// Drizzle ORM requires a client for PostgreSQL
const db = drizzle(pool, { schema });

module.exports = { db, pool };



