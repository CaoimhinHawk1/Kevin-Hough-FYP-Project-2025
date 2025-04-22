// backend/src/controllers/taskController.js
const taskRepository = require('../repository/taskRepository');
const { ApiError } = require('../middleware/error-handler');

/**
 * Get all tasks with optional filters
 */
exports.getAllTasks = async (req, res, next) => {
  console.log('TaskController.getAllTasks called with query:', req.query);

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
    console.log(`Retrieved ${tasks.length} tasks successfully`);

    // Transform data to match client-side Task interface
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      type: task.type.toLowerCase(), // Convert enum to lowercase string
      status: task.status.toLowerCase(),
      priority: task.priority.toLowerCase(),
      dueDate: task.dueDate,
      assignedTo: task.assignedTo || [],
      assignedUserIds: task.assignedUserIds || [],
      relatedItems: task.relatedItemIds || [],
      eventName: task.event?.name,
      location: task.location || task.event?.location,
      completedAt: task.completedAt,
      completedBy: task.completedByName,
      notes: task.notes,
      createdAt: task.createdAt
    }));

    res.status(200).json(transformedTasks);
  } catch (err) {
    console.error('Error in TaskController.getAllTasks:', err);
    next(err);
  }
};

/**
 * Get a specific task by ID
 */
exports.getTask = async (req, res, next) => {
  const taskId = req.params.id;
  console.log(`TaskController.getTask called for task ID: ${taskId}`);

  try {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      console.log(`Task with ID ${taskId} not found`);
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
      assignedTo: task.assignedTo || [],
      assignedUserIds: task.assignedUserIds || [],
      relatedItems: task.relatedItemIds || [],
      eventName: task.event?.name,
      location: task.location || task.event?.location,
      completedAt: task.completedAt,
      completedBy: task.completedByName,
      notes: task.notes,
      createdAt: task.createdAt
    };

    console.log(`Task ${taskId} retrieved successfully`);
    res.status(200).json(transformedTask);
  } catch (err) {
    console.error(`Error in TaskController.getTask for task ${taskId}:`, err);
    next(err);
  }
};

/**
 * Create a new task
 */
exports.createTask = async (req, res, next) => {
  console.log('TaskController.createTask called with body:', JSON.stringify(req.body, null, 2));
  console.log('Authenticated user:', req.user);

  try {
    // Validate required fields
    if (!req.body.title || !req.body.dueDate) {
      console.log('Missing required fields: title and dueDate must be provided');
      return next(ApiError.badRequest('Title and due date are required'));
    }

    // Get current user ID from the Firebase auth middleware
    const userId = req.user.uid;
    console.log(`Creating task for user ID: ${userId}`);

    // Prepare task data
    const taskData = {
      ...req.body,
      // Convert string values to expected formats
      type: req.body.type?.toUpperCase(),
      status: req.body.status?.toUpperCase(),
      priority: req.body.priority?.toUpperCase(),
      // Parse date strings to Date objects if needed
      dueDate: req.body.dueDate
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
      assignedTo: task.assignedTo || [],
      assignedUserIds: task.assignedUserIds || [],
      relatedItems: task.relatedItemIds || [],
      eventName: task.event?.name,
      location: task.location || task.event?.location,
      completedAt: task.completedAt,
      completedBy: task.completedByName,
      notes: task.notes,
      createdAt: task.createdAt
    };

    console.log(`Task created successfully with ID: ${task.id}`);
    res.status(201).json(transformedTask);
  } catch (err) {
    console.error('Error in TaskController.createTask:', err);
    next(err);
  }
};

/**
 * Update an existing task
 */
exports.updateTask = async (req, res, next) => {
  const taskId = req.params.id;
  console.log(`TaskController.updateTask called for task ID: ${taskId}`);
  console.log('Update data:', JSON.stringify(req.body, null, 2));

  try {
    // Check if task exists
    const existingTask = await taskRepository.findById(taskId);

    if (!existingTask) {
      console.log(`Task with ID ${taskId} not found`);
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

    // Convert string enums to uppercase
    if (updateData.type) updateData.type = updateData.type.toUpperCase();
    if (updateData.status) updateData.status = updateData.status.toUpperCase();
    if (updateData.priority) updateData.priority = updateData.priority.toUpperCase();

    // Update the task
    const updatedTask = await taskRepository.update(taskId, updateData);

    // Transform the updated task to match the client-side interface
    const transformedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || '',
      type: updatedTask.type.toLowerCase(),
      status: updatedTask.status.toLowerCase(),
      priority: updatedTask.priority.toLowerCase(),
      dueDate: updatedTask.dueDate,
      assignedTo: updatedTask.assignedTo || [],
      assignedUserIds: updatedTask.assignedUserIds || [],
      relatedItems: updatedTask.relatedItemIds || [],
      eventName: updatedTask.event?.name,
      location: updatedTask.location || updatedTask.event?.location,
      completedAt: updatedTask.completedAt,
      completedBy: updatedTask.completedByName,
      notes: updatedTask.notes,
      createdAt: updatedTask.createdAt
    };

    console.log(`Task ${taskId} updated successfully`);
    res.status(200).json(transformedTask);
  } catch (err) {
    console.error(`Error in TaskController.updateTask for task ${taskId}:`, err);
    next(err);
  }
};

/**
 * Delete a task
 */
exports.deleteTask = async (req, res, next) => {
  const taskId = req.params.id;
  console.log(`TaskController.deleteTask called for task ID: ${taskId}`);

  try {
    // Check if task exists
    const existingTask = await taskRepository.findById(taskId);

    if (!existingTask) {
      console.log(`Task with ID ${taskId} not found`);
      return next(ApiError.notFound('Task not found'));
    }

    // Delete the task
    await taskRepository.delete(taskId);

    console.log(`Task ${taskId} deleted successfully`);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(`Error in TaskController.deleteTask for task ${taskId}:`, err);
    next(err);
  }
};

/**
 * Get task statistics (counts by status, type, priority)
 */
exports.getTaskStats = async (req, res, next) => {
  console.log('TaskController.getTaskStats called');

  try {
    const stats = await taskRepository.getStats();
    console.log('Task statistics retrieved successfully');
    res.status(200).json(stats);
  } catch (err) {
    console.error('Error in TaskController.getTaskStats:', err);
    next(err);
  }
};