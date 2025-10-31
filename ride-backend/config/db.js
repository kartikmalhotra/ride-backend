const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // ✅ For Render (and any other hosted Postgres)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // required for Render's managed Postgres
    },
  });
} else {
  // ✅ For local Docker setup
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'RiderApp@1234',
    database: process.env.PGDATABASE || 'rides',
    port: process.env.PGPORT || 5433,
  });
}

pool
  .connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));

module.exports = { pool };
