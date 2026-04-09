const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkPermit = sequelize.define('WorkPermit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  visitor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'visits',
      key: 'id'
    }
  },
  worker_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  work_location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  pic_company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permit_file: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'work_permits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = WorkPermit;
