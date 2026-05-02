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
  max: 10, // Limit each IP to 10 requests
  message: { message: 'Too many registration attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Allow more for testing
  message: { message: 'Too many password reset requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health Check Route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'VMS API is running' });
});

router.get('/migrate-db', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    await sequelize.sync({ alter: true });
    res.json({ message: 'Database synced successfully with alter: true' });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing database', error: error.message });
  }
});

router.get('/test-email', async (req, res) => {
  try {
    const mailer = require('../utils/mailer');
    // Return redacted env info for debugging
    const user = process.env.EMAIL_USER || '';
    const envDebug = {
      EMAIL_USER_PATTERN: user ? `${user[0]}...${user.slice(-8)}` : 'MISSING',
      HAS_PASS: !!process.env.EMAIL_PASS,
      PASS_LEN: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
      NODE_ENV: process.env.NODE_ENV
    };
    
    const targetEmail = req.query.email || 'arief.yuliantoooo@gmail.com';
    const info = await mailer.sendDirectPasswordEmail(targetEmail, 'TEST_PASSWORD_123');
    res.json({ message: 'Test email success!', targetEmail, info, envDebug });
  } catch (error) {
    res.status(200).json({ 
      message: 'Test email failed', 
      error: error.message, 
      code: error.code,
      command: error.command,
      response: error.response,
      envDebug: {
        EMAIL_USER_PATTERN: (process.env.EMAIL_USER || '') ? `${(process.env.EMAIL_USER || '')[0]}...${(process.env.EMAIL_USER || '').slice(-8)}` : 'MISSING',
        HAS_PASS: !!process.env.EMAIL_PASS,
        PASS_LEN: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
      }
    });
  }
});

// Auth Routes
router.post('/register', registerLimiter, authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.get('/users/staff', authController.getStaffList);
router.post('/invite-staff', authMiddleware, authController.generateInvite);
router.get('/users', authMiddleware, authController.getAllUsers);
router.post('/users/create', authMiddleware, authController.createUser);
router.delete('/users/:id', authMiddleware, authController.deleteUser);
router.get('/auth/logs', authMiddleware, authController.getAuthLogs);
router.post('/auth/forgot-password', resetLimiter, authController.forgotPassword);

// Visit Routes
router.post('/visit', authMiddleware, visitController.createVisit);
router.post('/visit/public', visitController.createPublicVisit); // Public Guest Registration
router.get('/visits', authMiddleware, visitController.getAllVisits); // Typically for admin/security. Should have role check in real app.
router.get('/visits/me', authMiddleware, visitController.getUserVisits);
router.get('/visit/:id', authMiddleware, visitController.getVisitById);
router.get('/visit/qr/:code', authMiddleware, visitController.getVisitByQR);
router.patch('/visit/:id/status', authMiddleware, visitController.updateVisitStatus); // Approve/Reject
router.post('/visit/scan', authMiddleware, visitController.scanVisit); // Security scan QR
router.delete('/visit/:id', authMiddleware, visitController.deleteVisit); // Admin delete visit

// Work Permit Routes
router.post('/permit', authMiddleware, upload.single('permit_file'), permitController.createPermit);
router.get('/permit', authMiddleware, permitController.getAllPermits);

module.exports = router;
