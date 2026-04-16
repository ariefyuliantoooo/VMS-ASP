const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  role: DataTypes.STRING
}, { tableName: 'users', timestamps: false });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Production Database connected.');

    const admin = await User.findOne({ where: { username: 'admin' } });
    if (admin) {
      console.log('ADMIN FOUND:', admin.username, admin.email, admin.role);
    } else {
      console.log('ADMIN NOT FOUND in production database.');
    }

    const allAdmins = await User.findAll({ where: { role: 'ADMIN' } });
    console.log('Total Admins in Production:', allAdmins.length);
    allAdmins.forEach(u => console.log(`- ${u.username} (${u.email})`));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
