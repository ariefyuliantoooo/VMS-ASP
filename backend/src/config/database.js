// Explicit requires for Vercel Serverless (nft) to include native Sequelize dependencies
require('pg');
require('pg-hstore');
const { Sequelize } = require('sequelize');

let sequelize;

const dialectOptions = process.env.NODE_ENV === 'production' ? {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
} : {};

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
      dialectOptions
    }
  );
}

module.exports = sequelize;
