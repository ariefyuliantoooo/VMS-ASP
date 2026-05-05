require('dotenv').config({ path: '.env.production', override: true }); // Force load .env.production
require('dotenv').config(); // Load .env for fallback

const { Sequelize } = require('sequelize');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    dbUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

// Create a direct connection to run schema modifications
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' || dbUrl.includes('supabase') ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: console.log
});

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // 1. Create tenants table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        domain VARCHAR(255) UNIQUE,
        config JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created tenants table.');

    // 2. Insert Default Tenant
    const [results, metadata] = await sequelize.query(`
      INSERT INTO tenants (name, domain)
      VALUES ('VMS Utama', 'default')
      ON CONFLICT (name) DO NOTHING
      RETURNING id;
    `);
    
    let defaultTenantId = 1; // Fallback
    if (results && results.length > 0) {
      defaultTenantId = results[0].id;
    } else {
      const existing = await sequelize.query(`SELECT id FROM tenants WHERE name = 'VMS Utama' LIMIT 1`);
      if (existing[0].length > 0) {
        defaultTenantId = existing[0][0].id;
      }
    }
    console.log(`Default tenant ID is: ${defaultTenantId}`);

    // 3. Add tenant_id to users, visits, work_permits, auth_logs
    const tables = ['users', 'visits', 'work_permits', 'auth_logs'];
    for (const table of tables) {
      try {
        await sequelize.query(`
          ALTER TABLE ${table} 
          ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
        `);
        console.log(`Added tenant_id to ${table}`);

        // Update existing records to use default tenant
        await sequelize.query(`
          UPDATE ${table} SET tenant_id = ${defaultTenantId} WHERE tenant_id IS NULL;
        `);
        console.log(`Updated existing records in ${table} to use tenant_id ${defaultTenantId}`);
        
        // Uncomment below to enforce NOT NULL if needed (safer to leave nullable if issues exist)
        // await sequelize.query(`ALTER TABLE ${table} ALTER COLUMN tenant_id SET NOT NULL;`);
      } catch (err) {
        console.error(`Error migrating table ${table}:`, err.message);
      }
    }

    // 4. Migrate an admin to SUPERADMIN (e.g. check for a specific email or the first admin)
    // We'll just elevate the first admin found, or you can specify
    await sequelize.query(`
      UPDATE users SET role = 'SUPERADMIN' WHERE role = 'ADMIN' AND id = (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1);
    `);
    console.log('Elevated one ADMIN to SUPERADMIN.');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Unable to connect to the database or run migration:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
