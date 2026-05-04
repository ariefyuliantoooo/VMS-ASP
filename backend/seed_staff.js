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
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: { type: DataTypes.STRING },
  full_name: DataTypes.STRING,
  role: DataTypes.STRING,
  phone: DataTypes.STRING,
  company: DataTypes.STRING
}, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

(async () => {
  try {
    await sequelize.authenticate();
    const hashedPassword = await bcrypt.hash('staff123', 10);
    
    const [user, created] = await User.findOrCreate({
      where: { username: 'staff_vms' },
      defaults: {
        email: 'staff@vms.com',
        password: hashedPassword,
        full_name: 'Arief Yulianto (Staff)',
        role: 'STAFF',
        phone: '085272123300',
        company: 'VMS Official'
      }
    });

    if (created) {
       console.log('SUCCESS: Akun STAFF baru telah dibuat: Arief Yulianto (Staff)');
    } else {
       console.log('INFO: Akun STAFF sudah ada.');
       // Ensure role is STAFF just in case
       user.role = 'STAFF';
       await user.save();
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
