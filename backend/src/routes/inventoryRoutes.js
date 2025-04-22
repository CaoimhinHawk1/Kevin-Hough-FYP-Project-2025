// backend/src/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/auth-middleware');

// Public routes (optionally authenticated)
router.get('/', optionalAuth, inventoryController.getAllItems);
router.get('/stats', optionalAuth, inventoryController.getInventoryStats);
router.get('/:id', optionalAuth, inventoryController.getItemById);

// Protected routes (require authentication)
router.post('/', verifyFirebaseToken, inventoryController.createItem);
router.put('/:id', verifyFirebaseToken, inventoryController.updateItem);
router.delete('/:id', verifyFirebaseToken, inventoryController.deleteItem);

module.exports = router;