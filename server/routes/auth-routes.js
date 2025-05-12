const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const authMiddleware = require('../middlewares/auth-middleware');

// Routes d'authentification
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-token', authController.verifyToken);
router.get('/logout', authController.logout);
router.post('/disable-2fa', authMiddleware, authController.disable2FA);

module.exports = router; 