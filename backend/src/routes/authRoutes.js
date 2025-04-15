// backend/src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/firebase-auth');

const router = express.Router();

// Public auth routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/google-login', authController.googleLogin);
router.post('/logout', authController.logoutUser);
router.post('/reset-password', authController.resetPassword);

// Protected route - requires authentication
router.get('/me', verifyFirebaseToken, authController.getCurrentUser);

module.exports = router;