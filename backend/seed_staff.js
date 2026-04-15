const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

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
        full_name: 'Dany Ramadhan (Staff)',
        role: 'STAFF',
        phone: '0812345678',
        company: 'VMS Official'
      }
    });

    if (created) {
       console.log('SUCCESS: Akun STAFF baru telah dibuat: Dany Ramadhan (Staff)');
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
