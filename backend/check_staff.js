const { Sequelize, DataTypes } = require('sequelize');

const DATABASE_URL = "postgresql://postgres.sqokrrhcsxcszhvmytzt:jOFxEyCeifFnUj20@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const User = sequelize.define('User', {
  username: DataTypes.STRING,
  role: DataTypes.STRING,
  full_name: DataTypes.STRING
}, { tableName: 'users', timestamps: false });

(async () => {
  try {
    await sequelize.authenticate();
    const staff = await User.findAll({ where: { role: 'STAFF' } });
    console.log('STAFF COUNT:', staff.length);
    console.log('STAFF LIST:', staff.map(s => s.full_name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
