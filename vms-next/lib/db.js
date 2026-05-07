import { Pool } from 'pg';

const isLocalhost = process.env.DATABASE_URL?.includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isLocalhost ? {} : { ssl: { rejectUnauthorized: false } })
});

export default pool;
