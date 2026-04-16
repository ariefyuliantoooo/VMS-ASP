const fs = require('fs');
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
        
        console.log("Connected to Supabase. Running schema update...");
        
        const sql = fs.readFileSync('supabase_schema_update.sql', 'utf8');
        
        await client.query(sql);
        console.log("Schema update executed successfully!");
        
    } catch (err) {
        console.error("Error executing SQL:", err.message);
    } finally {
        await client.end();
    }
};

run();
