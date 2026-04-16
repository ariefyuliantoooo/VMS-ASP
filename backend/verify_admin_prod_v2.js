const { Sequelize, DataTypes } = require('sequelize');

const DATABASE_URL = "postgresql://postgres.sqokrrhcsxcszhvmytzt:jOFxEyCeifFnUj20@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  role: DataTypes.STRING,
  is_verified: DataTypes.BOOLEAN
}, { tableName: 'users', timestamps: false });

(async () => {
  try {
    await sequelize.authenticate();
    const admin = await User.findOne({ where: { username: 'admin' } });
    if (admin) {
      console.log('VERIFIED: Admin account exists in Production.');
      console.log('Username:', admin.username);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Verified:', admin.is_verified);
    } else {
      console.log('FAILURE: Admin account NOT FOUND in Production.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
