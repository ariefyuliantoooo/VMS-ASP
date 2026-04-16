const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
    console.log('Database connected.');

    // List all users to see what we have
    const users = await User.findAll();
    console.log('Current users in database:');
    users.forEach(u => console.log(`- ${u.username} (${u.email}) [Role: ${u.role}]`));

    const adminUsername = 'admin';
    const adminEmail = 'admin@vms.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Try to find by username first
    let user = await User.findOne({ where: { username: adminUsername } });

    if (user) {
      console.log(`INFO: User with username '${adminUsername}' already exists.`);
      user.role = 'ADMIN';
      user.is_verified = true;
      // Optionally update password if you want to ensure you can log in
      user.password = hashedPassword;
      await user.save();
      console.log('SUCCESS: User promoted to ADMIN and password reset to admin123.');
    } else {
      // Create new admin
      user = await User.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        full_name: 'System Administrator',
        role: 'ADMIN',
        is_verified: true
      });
      console.log('SUCCESS: New admin account created.');
      console.log('Email: ' + adminEmail);
      console.log('Password: ' + adminPassword);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
