// Example models for a Multi-tenant E-Learning Platform (LMS)

const { DataTypes } = require('sequelize');

module.exports = (sequelize, Tenant) => {
    // A Tenant represents an Educational Institution or School
    const Course = sequelize.define('Course', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tenant_id: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        instructor_id: { type: DataTypes.INTEGER } // Maps to User table
    });

    const Enrollment = sequelize.define('Enrollment', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tenant_id: { type: DataTypes.INTEGER, allowNull: false },
        course_id: { type: DataTypes.INTEGER, allowNull: false },
        student_id: { type: DataTypes.INTEGER, allowNull: false }, // Maps to User table
        enrolled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    // Define Associations
    Tenant.hasMany(Course, { foreignKey: 'tenant_id' });
    Course.belongsTo(Tenant, { foreignKey: 'tenant_id' });

    Tenant.hasMany(Enrollment, { foreignKey: 'tenant_id' });
    Enrollment.belongsTo(Tenant, { foreignKey: 'tenant_id' });

    Course.hasMany(Enrollment, { foreignKey: 'course_id' });
    Enrollment.belongsTo(Course, { foreignKey: 'course_id' });

    return { Course, Enrollment };
};
