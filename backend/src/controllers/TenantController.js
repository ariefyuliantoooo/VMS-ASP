const { Tenant, User } = require('../models');

const TenantController = {
  // Get all tenants (Superadmin only or public for list?)
  // For guests, we might want a public list of active tenants with limited info
  getAllTenants: async (req, res) => {
    try {
      // If Superadmin, return everything
      if (req.user && req.user.role === 'SUPERADMIN') {
        const tenants = await Tenant.findAll();
        return res.json(tenants);
      }

      // Otherwise, return public info (id, name, domain) for dropdowns
      const tenants = await Tenant.findAll({
        where: { is_active: true },
        attributes: ['id', 'name', 'domain']
      });
      res.json(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getTenantById: async (req, res) => {
    try {
      const { id } = req.params;
      const tenant = await Tenant.findByPk(id);
      
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Check access
      if (req.user && req.user.role !== 'SUPERADMIN' && req.user.tenant_id !== parseInt(id)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(tenant);
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createTenant: async (req, res) => {
    try {
      const { name, domain, config } = req.body;

      // Superadmin can create, or public can create if we allow self-registration
      // We will allow it for now
      const existingTenant = await Tenant.findOne({ where: { name } });
      if (existingTenant) {
        return res.status(400).json({ error: 'Tenant name already exists' });
      }

      const tenant = await Tenant.create({
        name,
        domain,
        config: config || {}
      });

      res.status(201).json(tenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateTenant: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, domain, config, is_active } = req.body;

      if (!req.user || (req.user.role !== 'SUPERADMIN' && req.user.tenant_id !== parseInt(id))) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const tenant = await Tenant.findByPk(id);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      await tenant.update({
        name: name !== undefined ? name : tenant.name,
        domain: domain !== undefined ? domain : tenant.domain,
        config: config !== undefined ? config : tenant.config,
        is_active: is_active !== undefined ? is_active : tenant.is_active
      });

      res.json(tenant);
    } catch (error) {
      console.error('Error updating tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = TenantController;
