// backend/src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { verifyFirebaseToken } = require('../middleware/firebase-auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken);

// Get all users and specific user
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;