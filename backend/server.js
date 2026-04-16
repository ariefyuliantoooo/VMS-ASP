require('dotenv').config(); // Trigger Redeploy V2
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (work permits, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'src/public/uploads')));

// Routes
app.use('/api', require('./src/routes'));

// Database connection & sync
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully.');
        return sequelize.sync({ alter: true }); // Auto-sync models and columns
    })
    .then(() => {
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        }
    })
    .catch(err => console.error('Database connection error:', err));

module.exports = app;
