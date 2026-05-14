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

const seedPath = path.resolve(__dirname, './sample-patients.sql');
const sql = fs.readFileSync(seedPath, 'utf8');

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

  console.log('Sample demo data seeded successfully.');
})().catch((error) => {
  console.error('Sample demo data seed failed:', error.message);
  process.exit(1);
});
