// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const customerRoutes = require('./customerRoutes');
const itemRoutes = require('./itemRoutes');

// API Routes
router.use('/api/auth', authRoutes);
router.use('/api/events', eventRoutes);
router.use('/api/customers', customerRoutes);
router.use('/api/items', itemRoutes);

module.exports = router;