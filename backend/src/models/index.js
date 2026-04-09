const sequelize = require('../config/database');

const User = require('./User');
const Visit = require('./Visit');
const WorkPermit = require('./WorkPermit');

// Define associations
User.hasMany(Visit, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Visit.belongsTo(User, { foreignKey: 'user_id' });

Visit.hasOne(WorkPermit, { foreignKey: 'visitor_id', onDelete: 'CASCADE' });
WorkPermit.belongsTo(Visit, { foreignKey: 'visitor_id' });

module.exports = {
  sequelize,
  User,
  Visit,
  WorkPermit
};
