require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

async function alterTable() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Add check_in_time
    await sequelize.query('ALTER TABLE visits ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE;');
    console.log('Added check_in_time column.');

    // Add check_out_time
    await sequelize.query('ALTER TABLE visits ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP WITH TIME ZONE;');
    console.log('Added check_out_time column.');

    // Add location
    await sequelize.query('ALTER TABLE visits ADD COLUMN IF NOT EXISTS location VARCHAR(255);');
    console.log('Added location column.');

    console.log('Database altered successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or alter table:', error);
  } finally {
    await sequelize.close();
  }
}

alterTable();
