const sequelize = require('../config/database');

const User = require('./User');
const Visit = require('./Visit');
const WorkPermit = require('./WorkPermit');
const AuthLog = require('./AuthLog');
const Tenant = require('./Tenant');

// Define associations
Tenant.hasMany(User, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
User.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Visit, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
Visit.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(WorkPermit, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
WorkPermit.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(AuthLog, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
AuthLog.belongsTo(Tenant, { foreignKey: 'tenant_id' });

User.hasMany(Visit, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Visit.belongsTo(User, { foreignKey: 'user_id' });

Visit.hasOne(WorkPermit, { foreignKey: 'visitor_id', onDelete: 'CASCADE' });
WorkPermit.belongsTo(Visit, { foreignKey: 'visitor_id' });

module.exports = {
  sequelize,
  Tenant,
  User,
  Visit,
  WorkPermit,
  AuthLog
};
