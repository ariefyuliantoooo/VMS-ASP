const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  visit_purpose: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  person_to_meet: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  visit_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  qr_code: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
    validate: {
      isIn: [['PENDING', 'CHECKED_IN', 'CHECKED_OUT']]
    }
  }
}, {
  tableName: 'visits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Visit;
