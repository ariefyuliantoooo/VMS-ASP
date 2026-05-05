// Example models for a Multi-tenant HRIS (Human Resource Information System)

const { DataTypes } = require('sequelize');

module.exports = (sequelize, Tenant) => {
    const Employee = sequelize.define('Employee', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tenant_id: { type: DataTypes.INTEGER, allowNull: false },
        emp_code: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        department: { type: DataTypes.STRING },
        position: { type: DataTypes.STRING },
        salary: { type: DataTypes.DECIMAL(10, 2) }
    });

    const Attendance = sequelize.define('Attendance', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tenant_id: { type: DataTypes.INTEGER, allowNull: false },
        employee_id: { type: DataTypes.INTEGER, allowNull: false },
        check_in: { type: DataTypes.DATE },
        check_out: { type: DataTypes.DATE },
        status: { type: DataTypes.STRING } // PRESENT, ABSENT, LEAVE
    });

    // Define Associations
    Tenant.hasMany(Employee, { foreignKey: 'tenant_id' });
    Employee.belongsTo(Tenant, { foreignKey: 'tenant_id' });

    Tenant.hasMany(Attendance, { foreignKey: 'tenant_id' });
    Attendance.belongsTo(Tenant, { foreignKey: 'tenant_id' });

    Employee.hasMany(Attendance, { foreignKey: 'employee_id' });
    Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });

    return { Employee, Attendance };
};
