const { Sequelize, DataTypes } = require('sequelize');

const DATABASE_URL = "postgresql://postgres.sqokrrhcsxcszhvmytzt:jOFxEyCeifFnUj20@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('SUCCESS: Connected to Production Database via Pooler.');
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Could not connect to Production Database.');
    console.error(err.message);
    process.exit(1);
  }
})();
