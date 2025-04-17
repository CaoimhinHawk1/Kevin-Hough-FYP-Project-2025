// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const customerRoutes = require('./customerRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const taskRoutes = require('./taskRoutes');
const userRoutes = require('./userRoutes');
const userAdminRoutes = require('./userAdminRoutes');

// API Routes
router.use('/api/auth', authRoutes);
router.use('/api/events', eventRoutes);
router.use('/api/customers', customerRoutes);
router.use('/api/inventory', inventoryRoutes);
router.use('/api/tasks', taskRoutes);
router.use('/api/users', userRoutes);
router.use('/api/admin/users', userAdminRoutes);

module.exports = router;