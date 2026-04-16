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
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'USER' },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  company: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING }
}, { tableName: 'users', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to Production Database.');

    const staffMembers = [
      {
        username: 'staff_official',
        email: 'staff@vms-asp.com',
        full_name: 'Dany Ramadhan (Staff)',
        role: 'STAFF',
        company: 'VMS ASP',
        phone: '08123456789'
      },
      {
        username: 'operational_staff',
        email: 'ops@vms-asp.com',
        full_name: 'Operational Manager',
        role: 'STAFF',
        company: 'VMS ASP',
        phone: '08129876543'
      }
    ];

    for (const s of staffMembers) {
      const hashedPassword = await bcrypt.hash('staff123', 10);
      const [user, created] = await User.findOrCreate({
        where: { email: s.email },
        defaults: {
          ...s,
          password: hashedPassword,
          is_verified: true
        }
      });

      if (created) {
        console.log(`SUCCESS: Staff member ${s.full_name} created.`);
      } else {
        console.log(`INFO: Staff member ${s.full_name} already exists. Ensuring role is STAFF...`);
        user.role = 'STAFF';
        await user.save();
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
