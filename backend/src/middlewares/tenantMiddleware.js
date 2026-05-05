const { Tenant } = require('../models');

// Middleware to resolve tenant from header or user object
const resolveTenant = async (req, res, next) => {
  try {
    let tenantId = null;

    // 1. If user is authenticated, use their tenant_id (unless they are SUPERADMIN)
    if (req.user) {
      if (req.user.role !== 'SUPERADMIN') {
        tenantId = req.user.tenant_id;
      }
    }

    // 2. If no tenantId from user (e.g., guest, or SUPERADMIN making a scoped request), check header
    if (!tenantId && req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'];
    }

    // Default to 1 (Default Tenant) if nothing is provided but needed, 
    // or we can let controllers handle missing tenant (e.g., guests must specify).
    if (tenantId) {
      req.tenant_id = parseInt(tenantId, 10);
    }

    next();
  } catch (error) {
    console.error('Error resolving tenant:', error);
    res.status(500).json({ error: 'Internal server error resolving tenant context' });
  }
};

// Middleware to ensure user is SUPERADMIN
const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Access denied. Superadmin only.' });
  }
  next();
};

module.exports = {
  resolveTenant,
  isSuperAdmin
};
