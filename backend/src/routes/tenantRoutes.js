const express = require('express');
const router = express.Router();
const TenantController = require('../controllers/TenantController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes (for dropdowns)
router.get('/', TenantController.getAllTenants);

// Protected routes (Superadmin to create, or public if we want self-service)
// For now, anyone can create a tenant (self-service signup)
router.post('/', TenantController.createTenant);

// Authenticated routes
router.use(authMiddleware);
router.get('/:id', TenantController.getTenantById);
router.put('/:id', TenantController.updateTenant);

module.exports = router;
