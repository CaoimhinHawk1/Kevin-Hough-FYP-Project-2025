// backend/src/controllers/taskController.js
const taskRepository = require('../repositories/task.repository');
const { ApiError } = require('../middleware/error-handler');

/**
 * Get all tasks with optional filters
 */
exports.getAllTasks = async (req, res, next) => {
  try {
    // Extract filter parameters from query
    const filters = {
      type: req.query.type,
      status: req.query.status,
      priority: req.query.priority,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const tasks = await taskRepository.findAll(filters);

    // Transform data to match client-side Task interface
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      type: task.type.toLowerCase(), // Convert enum to lowercase string
      status: task.status.toLowerCase(),
      priority: task.priority.toLowerCase(),
      dueDate: task.dueDate,
      assignedTo: task.assignedTo.map(user => user.name),
      relatedItems: task.relatedItemIds || [],
      eventName: task.event?.name,
      location: task.location || task.event?.location,
      completedAt: task.completedAt,
      completedBy: task.completedBy?.name,
      notes: task.notes,
      createdAt: task.createdAt
    }));

    res.status(200).json(transformedTasks);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific task by ID
 */
exports.getTask = async (req, res, next) => {
  try {
    const task = await taskRepository.findById(req.params.id);

    if (!task) {
      return next(ApiError.notFound('Task not found'));
    }

    // Transform data to match client-side Task interface
    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      type: task.type.toLowerCase(),
      status: task.status.toLowerCase(),
      priority: task.priority.toLowerCase(),
      dueDate: task.dueDate,
      assignedTo: task.assignedTo.map(user => user.name),
      relatedItems: task.relatedItemIds || [],
      eventName: task.event?.name,
      location: task.location || task.event?.location,
      completedAt: task.completedAt,
      completedBy: task.completedBy?.name,
      notes: task.notes,
      createdAt: task.createdAt
    };

    res.status(200).json(transformedTask);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new task
 */
exports.createTask = async (req, res, next) => {
  try {
    // Validate required fields
    if (!req.body.title || !req.body.dueDate) {
      return next(ApiError.badRequest('Title and due date are required'));
    }

    // Get current user ID from the Firebase auth middleware
    const userId = req.user.uid;

    // Prepare task data
    const taskData = {
      ...req.body,
      // Convert string values to expected formats
      type: req.body.type?.toUpperCase(),
      status: req.body.status?.toUpperCase(),
      priority: req.body.priority?.toUpperCase(),
      // Parse date strings to Date objects
      dueDate: new Date(req.body.dueDate)
    };

    // Create task
    const task = await taskRepository.create(taskData, userId);

    // Transform the created task to match the client-side interface
    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      type: task.type.toLowerCase(),
      status: task.status.toLowerCase(),
      priority: task.priority.toLowerCase(),
      dueDate: task.dueDate,
      assignedTo: task.assignedTo.map(user => user.name),
      relatedItems: task.relatedItemIds || [],
      eventName: task.event?.name,
      location: task.location || task.event?.location,
      completedAt: task.completedAt,
      completedBy: task.completedBy?.name,
      notes: task.notes,
      createdAt: task.createdAt
    };

    res.status(201).json(transformedTask);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing task
 */
exports.updateTask = async (req, res, next) => {
  try {
    // Check if task exists
    const existingTask = await taskRepository.findById(req.params.id);

    if (!existingTask) {
      return next(ApiError.notFound('Task not found'));
    }

    // Get current user ID
    const userId = req.user.uid;

    // Prepare update data
    const updateData = { ...req.body };

    // If marking as completed and completedAt isn't set, set it now
    if (updateData.status === 'COMPLETED' && !updateData.completedAt) {
      updateData.completedAt = new Date();
      updateData.completedById = userId;
    }

    // If changing from completed to another status, clear the completed fields
    if (existingTask.status === 'COMPLETED' && updateData.status && updateData.status !== 'COMPLETED') {
      updateData.completedAt = null;
      updateData.completedById = null;
    }

    // Convert date strings to Date objects
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    // Update the task
    const updatedTask = await taskRepository.update(req.params.id, updateData);

    // Transform the updated task to match the client-side interface
    const transformedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || '',
      type: updatedTask.type.toLowerCase(),
      status: updatedTask.status.toLowerCase(),
      priority: updatedTask.priority.toLowerCase(),
      dueDate: updatedTask.dueDate,
      assignedTo: updatedTask.assignedTo.map(user => user.name),
      relatedItems: updatedTask.relatedItemIds || [],
      eventName: updatedTask.event?.name,
      location: updatedTask.location || updatedTask.event?.location,
      completedAt: updatedTask.completedAt,
      completedBy: updatedTask.completedBy?.name,
      notes: updatedTask.notes,
      createdAt: updatedTask.createdAt
    };

    res.status(200).json(transformedTask);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a task
 */
exports.deleteTask = async (req, res, next) => {
  try {
    // Check if task exists
    const existingTask = await taskRepository.findById(req.params.id);

    if (!existingTask) {
      return next(ApiError.notFound('Task not found'));
    }

    // Delete the task
    await taskRepository.delete(req.params.id);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Get task statistics (counts by status, type, priority)
 */
exports.getTaskStats = async (req, res, next) => {
  try {
    const stats = await taskRepository.getStats();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};