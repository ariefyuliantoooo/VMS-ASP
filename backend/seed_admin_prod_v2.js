const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Using the URL from seed_staff.js which seems to be the intended prod DB
const DATABASE_URL = "postgresql://postgres.sqokrrhcsxcszhvmytzt:jOFxEyCeifFnUj20@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'USER' },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Production Database connected via Pooler.');

    const adminUsername = 'admin';
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if exists
    let user = await User.findOne({ where: { username: adminUsername } });

    if (user) {
      console.log(`INFO: User '${adminUsername}' exists in Prod DB. Role: ${user.role}`);
      user.role = 'ADMIN';
      user.is_verified = true;
      user.password = hashedPassword;
      await user.save();
      console.log('SUCCESS: Admin account updated in Prod DB.');
    } else {
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        full_name: 'System Administrator',
        role: 'ADMIN',
        is_verified: true
      });
      console.log('SUCCESS: New Admin account created in Prod DB.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
