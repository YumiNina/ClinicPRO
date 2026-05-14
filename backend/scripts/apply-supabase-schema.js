const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL. Add the Supabase Postgres connection string to backend/.env.');
  process.exit(1);
}

const schemaPath = path.resolve(__dirname, '../src/config/init-db.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

(async () => {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  await client.query(sql);
  await client.end();

  console.log('Schema applied successfully.');
})().catch(async (error) => {
  console.error('Schema apply failed:', error.message);
  process.exit(1);
});
