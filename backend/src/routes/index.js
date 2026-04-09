const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const visitController = require('../controllers/visitController');
const permitController = require('../controllers/permitController');

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Visit Routes
router.post('/visit', authMiddleware, visitController.createVisit);
router.get('/visits', authMiddleware, visitController.getAllVisits); // Typically for admin/security. Should have role check in real app.
router.get('/visits/me', authMiddleware, visitController.getUserVisits);
router.get('/visit/:id', authMiddleware, visitController.getVisitById);
router.post('/visit/scan', authMiddleware, visitController.scanVisit); // Security scan QR
router.delete('/visit/:id', authMiddleware, visitController.deleteVisit); // Admin delete visit

// Work Permit Routes
router.post('/permit', authMiddleware, upload.single('permit_file'), permitController.createPermit);
router.get('/permit', authMiddleware, permitController.getAllPermits);

module.exports = router;
