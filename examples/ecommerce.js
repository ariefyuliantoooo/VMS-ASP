// Example models for a Multi-tenant E-Commerce Platform (Shopify alternative)

const { DataTypes } = require('sequelize');

module.exports = (sequelize, Tenant) => {
    // A Tenant represents a Store (e.g. "My Shoe Shop")
    const Product = sequelize.define('Product', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tenant_id: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        stock: { type: DataTypes.INTEGER, defaultValue: 0 }
    });

    const Order = sequelize.define('Order', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        tenant_id: { type: DataTypes.INTEGER, allowNull: false },
        customer_name: { type: DataTypes.STRING, allowNull: false },
        customer_email: { type: DataTypes.STRING },
        total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        status: { type: DataTypes.STRING, defaultValue: 'PENDING' } // PENDING, PAID, SHIPPED
    });

    // Define Associations
    Tenant.hasMany(Product, { foreignKey: 'tenant_id' });
    Product.belongsTo(Tenant, { foreignKey: 'tenant_id' });

    Tenant.hasMany(Order, { foreignKey: 'tenant_id' });
    Order.belongsTo(Tenant, { foreignKey: 'tenant_id' });

    return { Product, Order };
};
