// backend/src/routes/userAdminRoutes.js
const express = require('express');
const userAdminController = require('../controllers/userAdminController');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/firebase-auth');

const router = express.Router();

// All routes require admin privileges
router.use(verifyFirebaseToken);
router.use(requireAdmin);

// User management routes (admin only)
router.get('/', userAdminController.getAllUsers);
router.get('/:id', userAdminController.getUserById);
router.patch('/:id/role', userAdminController.updateUserRole);
router.delete('/:id', userAdminController.deleteUser);

module.exports = router;