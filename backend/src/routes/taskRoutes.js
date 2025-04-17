// backend/src/routes/taskRoutes.js
const express = require('express');
const taskController = require('../controllers/taskController');
const { verifyFirebaseToken } = require('../middleware/firebase-auth');

const router = express.Router();

// Apply authentication middleware to all routes
// Use JWT verification middleware for all routes
router.use(verifyFirebaseToken);

// Get all tasks and create new task
router.route('/')
    .get(taskController.getAllTasks)
    .post(taskController.createTask);

// Get task statistics
router.get('/stats', taskController.getTaskStats);

// Get, update and delete specific task
router.route('/:id')
    .get(taskController.getTask)
    .put(taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;