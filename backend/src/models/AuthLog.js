const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthLog = sequelize.define('AuthLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ip_address: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'auth_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Only need creation time
});

module.exports = AuthLog;
