const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123qweASD@localhost:5432/vms_db' });

async function test() {
  try {
    const res = await pool.query('SELECT * FROM tenants LIMIT 1');
    console.log('Select successful:', res.rows);
  } catch(e) {
    console.error('Select failed:', e.message);
  }
  
  try {
    const res = await pool.query('INSERT INTO tenants (name, domain, is_active, created_at, updated_at) VALUES ($1, $2, true, NOW(), NOW()) RETURNING *', ['Test Tenant 2', 'test2.com']);
    console.log('Insert successful:', res.rows);
  } catch(e) {
    console.error('Insert failed:', e.message);
  }
  pool.end();
}

test();
