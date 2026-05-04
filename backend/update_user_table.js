const { Client } = require('pg');

const run = async () => {
    const client = new Client({
        host: "db.sqokrrhcsxcszhvmytzt.supabase.co",
        database: "postgres",
        user: "postgres",
        password: "jOFxEyCeifFnUj20",
        port: 6543,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log("Connected to Supabase.");
        
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS reset_password_otp VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;
        `);
        console.log("Successfully added reset_password_otp and reset_password_expires to users table.");
        
    } catch (err) {
        console.error("Error executing SQL:", err.message);
    } finally {
        await client.end();
    }
};

run();
