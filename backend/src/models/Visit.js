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
    allowNull: true,
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
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  check_out_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
    validate: {
      isIn: [['PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'DONE']]
    }
  }
}, {
  tableName: 'visits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Visit;
