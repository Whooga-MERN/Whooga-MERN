import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export default defineConfig({
  schema: './config/schema.js', // Adjust the path to your schema file (use .ts if it's TypeScript)
  out: './migrations', // Directory to output migration files
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});


