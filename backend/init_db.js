const { Client } = require('pg');
require('dotenv').config();

const initDb = async () => {
    // Connection configuration to the default 'postgres' database
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '123qweASD',
        database: 'postgres', // Connect to default database first
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL server.');

        // Check if vms_db exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'vms_db'");
        
        if (res.rowCount === 0) {
            console.log('Database "vms_db" does not exist. Creating...');
            await client.query('CREATE DATABASE vms_db');
            console.log('Database "vms_db" created successfully.');
        } else {
            console.log('Database "vms_db" already exists.');
        }

    } catch (err) {
        console.error('Error during database initialization:', err.message);
    } finally {
        await client.end();
    }
};

initDb();
