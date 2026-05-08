const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

async function getExecutedMigrations(client) {
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map(r => r.filename));
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Multi-Tenant Schema Migration...');

    // 1. RUN PUBLIC MIGRATIONS
    console.log('\n📦 Running Public Schema Migrations...');
    await client.query('SET search_path TO public');
    await ensureMigrationTable(client);
    const executedPublic = await getExecutedMigrations(client);

    const publicMigrationDir = path.join(__dirname, '../migrations/public');
    const publicFiles = fs.readdirSync(publicMigrationDir).sort();

    for (const file of publicFiles) {
      if (file.endsWith('.sql') && !executedPublic.has(file)) {
        console.log(`  Executing: ${file}`);
        const sql = fs.readFileSync(path.join(publicMigrationDir, file), 'utf8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      } else if (file.endsWith('.sql')) {
        console.log(`  Skipping (already executed): ${file}`);
      }
    }

    // 2. FETCH ALL TENANTS
    const { rows: tenants } = await client.query('SELECT slug, db_schema FROM tenants WHERE status = \'active\'');
    console.log(`\n👥 Found ${tenants.length} active tenants.`);

    // 3. RUN TENANT MIGRATIONS FOR EACH TENANT
    const tenantMigrationDir = path.join(__dirname, '../migrations/tenant');
    const tenantFiles = fs.readdirSync(tenantMigrationDir).sort();

    for (const tenant of tenants) {
      console.log(`\n🏢 Migrating Tenant: ${tenant.slug} (Schema: ${tenant.db_schema})`);
      
      // Ensure schema exists
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${tenant.db_schema}"`);
      
      // Set search path to tenant schema
      await client.query(`SET search_path TO "${tenant.db_schema}", public`);
      
      await ensureMigrationTable(client);
      const executedTenant = await getExecutedMigrations(client);

      for (const file of tenantFiles) {
        if (file.endsWith('.sql') && !executedTenant.has(file)) {
          console.log(`  Executing: ${file}`);
          const sql = fs.readFileSync(path.join(tenantMigrationDir, file), 'utf8');
          
          await client.query('BEGIN');
          try {
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
            await client.query('COMMIT');
          } catch (err) {
            await client.query('ROLLBACK');
            throw err;
          }
        } else if (file.endsWith('.sql')) {
          console.log(`  Skipping (already executed): ${file}`);
        }
      }
    }

    // Reset search path
    await client.query('SET search_path TO public');
    
    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
