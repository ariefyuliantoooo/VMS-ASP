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

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Multi-Tenant Schema Migration...');

    // 1. RUN PUBLIC MIGRATIONS
    const publicMigrationDir = path.join(__dirname, '../migrations/public');
    const publicFiles = fs.readdirSync(publicMigrationDir).sort();

    console.log('\n📦 Running Public Schema Migrations...');
    for (const file of publicFiles) {
      if (file.endsWith('.sql')) {
        console.log(`  Executing: ${file}`);
        const sql = fs.readFileSync(path.join(publicMigrationDir, file), 'utf8');
        await client.query(sql);
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
      
      // Ensure schema exists - QUOTE schema name
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${tenant.db_schema}"`);
      
      // Set search path to tenant schema - QUOTE schema name
      await client.query(`SET search_path TO "${tenant.db_schema}", public`);

      for (const file of tenantFiles) {
        if (file.endsWith('.sql')) {
          console.log(`  Executing: ${file}`);
          const sql = fs.readFileSync(path.join(tenantMigrationDir, file), 'utf8');
          await client.query(sql);
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
