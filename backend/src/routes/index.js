const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const visitController = require('../controllers/visitController');
const permitController = require('../controllers/permitController');

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 create account requests per `window` (here, per 15 minutes)
  message: { message: 'Too many registration attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Health Check Route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'VMS API is running' });
});

// Auth Routes
router.post('/register', registerLimiter, authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.get('/users/staff', authMiddleware, authController.getStaffList);
router.post('/invite-staff', authMiddleware, authController.generateInvite);

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
