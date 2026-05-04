require('dotenv').config();
const { User, AuthLog } = require('./src/models');


async function check() {
  try {
    console.log('--- LATEST USERS ---');
    const users = await User.findAll({ limit: 5, order: [['id', 'DESC']] });
    users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}, Verified: ${u.is_verified}, OTP: ${u.reset_password_otp}`));

    console.log('\n--- LATEST AUTH LOGS ---');
    const logs = await AuthLog.findAll({ limit: 10, order: [['id', 'DESC']] });
    logs.forEach(l => console.log(`[${l.created_at}] Action: ${l.action}, Email: ${l.email}, Details: ${l.details}`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
