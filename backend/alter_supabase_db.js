require('dotenv').config({ path: '.env.production' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  }
);

async function alterTable() {
  try {
    await sequelize.authenticate();
    console.log('Connection to Supabase has been established successfully.');

    // Add check_in_time
    await sequelize.query('ALTER TABLE visits ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE;');
    console.log('Added check_in_time column to Supabase.');

    // Add check_out_time
    await sequelize.query('ALTER TABLE visits ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP WITH TIME ZONE;');
    console.log('Added check_out_time column to Supabase.');

    // Add location
    await sequelize.query('ALTER TABLE visits ADD COLUMN IF NOT EXISTS location VARCHAR(255);');
    console.log('Added location column to Supabase.');

    console.log('Supabase database altered successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or alter table:', error);
  } finally {
    await sequelize.close();
  }
}

alterTable();
