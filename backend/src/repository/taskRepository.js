// backend/src/repositories/task.repository.js
const prisma = require('../services/prisma.service');
const { admin } = require('../config/firebase');

class TaskRepository {
    /**
     * Get all tasks with optional filters
     * @param {Object} filters - Query filters
     */
    async findAll(filters = {}) {
        console.log('TaskRepository.findAll called with filters:', filters);

        const where = {};

        // Apply type filter
        if (filters.type) {
            where.type = filters.type.toUpperCase();
        }

        // Apply status filter
        if (filters.status) {
            where.status = filters.status.toUpperCase();
        }

        // Apply priority filter
        if (filters.priority) {
            where.priority = filters.priority.toUpperCase();
        }

        // Apply date range filters
        if (filters.startDate || filters.endDate) {
            where.dueDate = {};

            if (filters.startDate) {
                where.dueDate.gte = new Date(filters.startDate);
            }

            if (filters.endDate) {
                where.dueDate.lte = new Date(filters.endDate);
            }
        }

        try {
            // Include related data
            const include = {
                assignedUsers: {
                    include: {
                        user: true
                    }
                },
                createdBy: true,
                completedBy: true,
                event: true,
                customer: true
            };

            console.log('Executing Prisma query with where:', where);

            const tasks = await prisma.task.findMany({
                where,
                include,
                orderBy: { dueDate: 'asc' }
            });

            console.log(`Retrieved ${tasks.length} tasks from database`);

            // Format the tasks to include user information
            return this.formatTasksWithUserInfo(tasks);
        } catch (error) {
            console.error('Error in TaskRepository.findAll:', error);
            throw error;
        }
    }

    /**
     * Find a task by ID
     * @param {string} id - Task ID
     */
    async findById(id) {
        console.log(`TaskRepository.findById called with id: ${id}`);

        try {
            const task = await prisma.task.findUnique({
                where: { id },
                include: {
                    assignedUsers: {
                        include: {
                            user: true
                        }
                    },
                    createdBy: true,
                    completedBy: true,
                    event: true,
                    customer: true,
                    marquee: true,
                    portaloo: true,
                    trailer: true
                }
            });

            if (!task) {
                console.log(`No task found with id: ${id}`);
                return null;
            }

            // Format single task with user information
            console.log(`Found task with id: ${id}`);
            const formattedTasks = await this.formatTasksWithUserInfo([task]);
            return formattedTasks[0];
        } catch (error) {
            console.error(`Error in TaskRepository.findById for id ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create a new task
     * @param {Object} data - Task data
     * @param {string} userId - ID of user creating the task
     */
    async create(data, userId) {
        console.log('TaskRepository.create called with data:', JSON.stringify(data, null, 2));
        console.log('Creator userId:', userId);

        // Prepare task data
        const { assignedUserIds = [], ...taskData } = data;

        // Make sure required fields are set
        if (!taskData.type) taskData.type = 'GENERAL';
        if (!taskData.status) taskData.status = 'PENDING';
        if (!taskData.priority) taskData.priority = 'MEDIUM';

        try {
            // First check if the creator user exists
            const creatorExists = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!creatorExists) {
                console.log(`Creator user with ID ${userId} not found, creating placeholder user record`);

                // Create a placeholder user if not exists
                await prisma.user.create({
                    data: {
                        id: userId,
                        name: 'Unknown User',
                        email: `user_${userId}@placeholder.com`,
                        role: 'USER',
                        isAdmin: false
                    }
                });

                console.log(`Created placeholder user with ID ${userId}`);
            }

            // Prepare the task data object for Prisma
            const taskCreateData = {
                title: taskData.title,
                description: taskData.description || null,
                type: taskData.type,
                status: taskData.status,
                priority: taskData.priority,
                dueDate: new Date(taskData.dueDate),
                location: taskData.location || null,
                notes: taskData.notes || null,
                relatedItemIds: taskData.relatedItems || [],

                // Connect to the creator
                createdBy: {
                    connect: { id: userId }
                }
            };

            // Only include valid connections for optional relations
            if (taskData.eventId) {
                taskCreateData.event = { connect: { id: taskData.eventId } };
            }

            if (taskData.customerId) {
                taskCreateData.customer = { connect: { id: taskData.customerId } };
            }

            if (taskData.marqueeId) {
                taskCreateData.marquee = { connect: { id: taskData.marqueeId } };
            }

            if (taskData.portalooId) {
                taskCreateData.portaloo = { connect: { id: taskData.portalooId } };
            }

            if (taskData.trailerId) {
                taskCreateData.trailer = { connect: { id: taskData.trailerId } };
            }

            console.log('Creating task with data:', JSON.stringify(taskCreateData, null, 2));

            // Create the task
            const task = await prisma.task.create({
                data: taskCreateData,
                include: {
                    createdBy: true,
                    event: true,
                    customer: true
                }
            });

            console.log(`Task created successfully with ID: ${task.id}`);

            // If there are assigned users, create the connections separately
            if (assignedUserIds && assignedUserIds.length > 0) {
                console.log(`Processing ${assignedUserIds.length} user assignments`);

                for (const assignUserId of assignedUserIds) {
                    try {
                        // Check if user exists
                        let user = await prisma.user.findUnique({
                            where: { id: assignUserId }
                        });

                        // Create placeholder user if not exists
                        if (!user) {
                            console.log(`Assigned user with ID ${assignUserId} not found, creating placeholder user`);
                            user = await prisma.user.create({
                                data: {
                                    id: assignUserId,
                                    name: 'Unknown User',
                                    email: `user_${assignUserId}@placeholder.com`,
                                    role: 'USER',
                                    isAdmin: false
                                }
                            });
                            console.log(`Created placeholder user with ID ${assignUserId}`);
                        }

                        // Create the task-user assignment
                        await prisma.task_User.create({
                            data: {
                                task: { connect: { id: task.id } },
                                user: { connect: { id: assignUserId } }
                            }
                        });

                        console.log(`Created task assignment for user ${assignUserId}`);
                    } catch (error) {
                        console.error(`Error assigning user ${assignUserId} to task:`, error);
                        // Continue with other users even if one fails
                    }
                }
            }

            // Fetch the complete task with all relations
            console.log('Fetching complete task with all relations');
            const completeTask = await this.findById(task.id);
            return completeTask;
        } catch (error) {
            console.error('Error in TaskRepository.create:', error);
            throw error;
        }
    }

    /**
     * Update a task
     * @param {string} id - Task ID
     * @param {Object} data - Updated task data
     */
    async update(id, data) {
        console.log(`TaskRepository.update called for task ${id} with data:`, JSON.stringify(data, null, 2));

        const { assignedUserIds, ...updateData } = data;

        try {
            // Prepare the update data
            const taskUpdateData = { ...updateData };

            // Handle date conversions
            if (taskUpdateData.dueDate) {
                taskUpdateData.dueDate = new Date(taskUpdateData.dueDate);
            }

            // Handle relatedItems if present
            if (taskUpdateData.relatedItems) {
                taskUpdateData.relatedItemIds = taskUpdateData.relatedItems;
                delete taskUpdateData.relatedItems;
            }

            // Handle optional relations
            if (updateData.eventId) {
                taskUpdateData.event = { connect: { id: updateData.eventId } };
                delete taskUpdateData.eventId;
            }

            if (updateData.customerId) {
                taskUpdateData.customer = { connect: { id: updateData.customerId } };
                delete taskUpdateData.customerId;
            }

            if (updateData.marqueeId) {
                taskUpdateData.marquee = { connect: { id: updateData.marqueeId } };
                delete taskUpdateData.marqueeId;
            }

            if (updateData.portalooId) {
                taskUpdateData.portaloo = { connect: { id: updateData.portalooId } };
                delete taskUpdateData.portalooId;
            }

            if (updateData.trailerId) {
                taskUpdateData.trailer = { connect: { id: updateData.trailerId } };
                delete taskUpdateData.trailerId;
            }

            if (updateData.completedById) {
                // Check if user exists
                let user = await prisma.user.findUnique({
                    where: { id: updateData.completedById }
                });

                // Create placeholder user if not exists
                if (!user) {
                    console.log(`Completion user with ID ${updateData.completedById} not found, creating placeholder user`);
                    user = await prisma.user.create({
                        data: {
                            id: updateData.completedById,
                            name: 'Unknown User',
                            email: `user_${updateData.completedById}@placeholder.com`,
                            role: 'USER',
                            isAdmin: false
                        }
                    });
                }

                taskUpdateData.completedBy = { connect: { id: updateData.completedById } };
                delete taskUpdateData.completedById;
            }

            console.log('Updating task with data:', JSON.stringify(taskUpdateData, null, 2));

            // Update the task
            const task = await prisma.task.update({
                where: { id },
                data: taskUpdateData,
                include: {
                    createdBy: true,
                    completedBy: true,
                    event: true,
                    customer: true
                }
            });

            console.log(`Task ${id} updated successfully`);

            // If assignedUserIds is provided, update the assignments
            if (assignedUserIds !== undefined) {
                // First, delete all current assignments
                const deletedAssignments = await prisma.task_User.deleteMany({
                    where: { taskId: id }
                });

                console.log(`Deleted ${deletedAssignments.count} existing user assignments`);

                // Then create new assignments if there are any users
                if (assignedUserIds && assignedUserIds.length > 0) {
                    console.log(`Creating ${assignedUserIds.length} new user assignments`);

                    for (const assignUserId of assignedUserIds) {
                        try {
                            // Check if user exists
                            let user = await prisma.user.findUnique({
                                where: { id: assignUserId }
                            });

                            // Create placeholder user if not exists
                            if (!user) {
                                console.log(`Assigned user with ID ${assignUserId} not found, creating placeholder user`);
                                user = await prisma.user.create({
                                    data: {
                                        id: assignUserId,
                                        name: 'Unknown User',
                                        email: `user_${assignUserId}@placeholder.com`,
                                        role: 'USER',
                                        isAdmin: false
                                    }
                                });
                            }

                            // Create the task-user assignment
                            await prisma.task_User.create({
                                data: {
                                    task: { connect: { id: task.id } },
                                    user: { connect: { id: assignUserId } }
                                }
                            });

                            console.log(`Created task assignment for user ${assignUserId}`);
                        } catch (error) {
                            console.error(`Error assigning user ${assignUserId} to task:`, error);
                            // Continue with other users even if one fails
                        }
                    }
                }
            }

            // Fetch the complete task with all relations
            console.log('Fetching complete task with all relations');
            const completeTask = await this.findById(task.id);
            return completeTask;
        } catch (error) {
            console.error(`Error in TaskRepository.update for task ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a task
     * @param {string} id - Task ID
     */
    async delete(id) {
        console.log(`TaskRepository.delete called for task ${id}`);

        try {
            // First delete all task user assignments
            const deletedAssignments = await prisma.task_User.deleteMany({
                where: { taskId: id }
            });

            console.log(`Deleted ${deletedAssignments.count} user assignments for task ${id}`);

            // Then delete the task
            const deletedTask = await prisma.task.delete({
                where: { id }
            });

            console.log(`Task ${id} deleted successfully`);
            return deletedTask;
        } catch (error) {
            console.error(`Error in TaskRepository.delete for task ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get tasks statistics (counts by status, type, priority)
     */
    async getStats() {
        console.log('TaskRepository.getStats called');

        try {
            // Today's date (start of day)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get count of tasks by status
            const statusCounts = await prisma.task.groupBy({
                by: ['status'],
                _count: { _all: true }
            });

            // Get count of tasks by type
            const typeCounts = await prisma.task.groupBy({
                by: ['type'],
                _count: { _all: true }
            });

            // Get count of tasks by priority
            const priorityCounts = await prisma.task.groupBy({
                by: ['priority'],
                _count: { _all: true }
            });

            // Count today's tasks (not completed)
            const todayTasks = await prisma.task.count({
                where: {
                    dueDate: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    },
                    status: { not: 'COMPLETED' }
                }
            });

            // Count upcoming tasks (future date, not completed)
            const upcomingTasks = await prisma.task.count({
                where: {
                    dueDate: { gt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                    status: { not: 'COMPLETED' }
                }
            });

            // Count overdue tasks (past date, not completed)
            const overdueTasks = await prisma.task.count({
                where: {
                    dueDate: { lt: today },
                    status: { not: 'COMPLETED' }
                }
            });

            // Count total tasks
            const totalTasks = await prisma.task.count();

            // Format the counts into a stats object
            const stats = {
                totalTasks,
                statusCounts: Object.fromEntries(
                    statusCounts.map(({ status, _count }) => [status.toLowerCase(), _count._all])
                ),
                typeCounts: Object.fromEntries(
                    typeCounts.map(({ type, _count }) => [type.toLowerCase(), _count._all])
                ),
                priorityCounts: Object.fromEntries(
                    priorityCounts.map(({ priority, _count }) => [priority.toLowerCase(), _count._all])
                ),
                todayTasks,
                upcomingTasks,
                overdueTasks
            };

            console.log('Task stats retrieved successfully:', stats);
            return stats;
        } catch (error) {
            console.error('Error in TaskRepository.getStats:', error);
            throw error;
        }
    }

    /**
     * Get tasks assigned to a specific user
     * @param {string} userId - User ID
     */
    async getTasksByUser(userId) {
        console.log(`TaskRepository.getTasksByUser called for user ${userId}`);

        try {
            const tasks = await prisma.task.findMany({
                where: {
                    assignedUsers: {
                        some: {
                            userId
                        }
                    }
                },
                include: {
                    assignedUsers: {
                        include: {
                            user: true
                        }
                    },
                    createdBy: true,
                    completedBy: true,
                    event: true,
                    customer: true
                },
                orderBy: { dueDate: 'asc' }
            });

            console.log(`Retrieved ${tasks.length} tasks assigned to user ${userId}`);
            return this.formatTasksWithUserInfo(tasks);
        } catch (error) {
            console.error(`Error in TaskRepository.getTasksByUser for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Format tasks to include user information in a consistent way
     * @param {Array} tasks - Array of task objects from Prisma
     */
    async formatTasksWithUserInfo(tasks) {
        if (!tasks || tasks.length === 0) return [];

        return tasks.map(task => {
            // Create an array of user display names from the task_user relations
            const assignedTo = task.assignedUsers.map(assignment =>
                assignment.user.name || 'Unknown User'
            );

            // Create an array of user IDs for the API
            const assignedUserIds = task.assignedUsers.map(assignment =>
                assignment.userId
            );

            // Format the task object
            return {
                ...task,
                assignedTo,
                assignedUserIds,
                // Keep only necessary properties from related objects
                createdByName: task.createdBy ? task.createdBy.name : null,
                completedByName: task.completedBy ? task.completedBy.name : null
            };
        });
    }
}

module.exports = new TaskRepository();