const express = require('express');
const eventController = require('../controllers/eventController');
const { verifyFirebaseToken, requireAdmin, optionalAuth } = require('../middleware/firebase-auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, eventController.getAllEvents);
router.get('/:id', optionalAuth, eventController.getEvent);

// Protected routes - require authentication
router.post('/', verifyFirebaseToken, eventController.createEvent);
router.put('/:id', verifyFirebaseToken, eventController.updateEvent);
router.delete('/:id', verifyFirebaseToken, eventController.deleteEvent);

module.exports = router;