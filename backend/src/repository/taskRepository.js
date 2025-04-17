// backend/src/repositories/task.repository.js
const prisma = require('../services/prisma.service');
const { admin } = require('../config/firebase');

class TaskRepository {
    /**
     * Get all tasks with optional filters
     * @param {Object} filters - Query filters
     */
    async findAll(filters = {}) {
        const where = {};

        // Apply type filter
        if (filters.type) {
            where.type = filters.type;
        }

        // Apply status filter
        if (filters.status) {
            where.status = filters.status;
        }

        // Apply priority filter
        if (filters.priority) {
            where.priority = filters.priority;
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

        // Include related data
        const include = {
            assignedUsers: true, // Include assigned users from the Task_User relation
            createdBy: true,
            completedBy: true,
            event: true,
            customer: true
        };

        const tasks = await prisma.task.findMany({
            where,
            include,
            orderBy: { dueDate: 'asc' }
        });

        // Fetch Firebase user information for assigned user IDs
        return await this.populateUserInformation(tasks);
    }

    /**
     * Find a task by ID
     * @param {string} id - Task ID
     */
    async findById(id) {
        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                assignedUsers: true,
                createdBy: true,
                completedBy: true,
                event: true,
                customer: true,
                marquee: true,
                portaloo: true,
                trailer: true
            }
        });

        if (!task) return null;

        // Populate with Firebase user information
        const tasks = await this.populateUserInformation([task]);
        return tasks[0];
    }

    /**
     * Create a new task
     * @param {Object} data - Task data
     * @param {string} userId - ID of user creating the task
     * @param {string[]} assignedUserIds - IDs of users assigned to the task
     */
    async create(data, userId, assignedUserIds = []) {
        // Extract any data that needs special handling
        const { assignedUserIds: dataUserIds, ...taskData } = data;

        // Use provided userIds or ones from the data
        const userIds = assignedUserIds.length > 0 ? assignedUserIds : (dataUserIds || []);

        // Create connections for related entities if provided
        const connectData = {
            createdBy: { connect: { id: userId } }
        };

        // If assigned user IDs are provided, connect them
        if (userIds && userIds.length > 0) {
            connectData.assignedUsers = {
                create: userIds.map(uid => ({
                    user: { connect: { id: uid } }
                }))
            };
        }

        if (data.eventId) {
            connectData.event = { connect: { id: data.eventId } };
        }

        if (data.customerId) {
            connectData.customer = { connect: { id: data.customerId } };
        }

        if (data.marqueeId) {
            connectData.marquee = { connect: { id: data.marqueeId } };
        }

        if (data.portalooId) {
            connectData.portaloo = { connect: { id: data.portalooId } };
        }

        if (data.trailerId) {
            connectData.trailer = { connect: { id: data.trailerId } };
        }

        // Convert string values to enum values
        if (taskData.type) {
            taskData.type = taskData.type.toUpperCase();
        }

        if (taskData.status) {
            taskData.status = taskData.status.toUpperCase();
        }

        if (taskData.priority) {
            taskData.priority = taskData.priority.toUpperCase();
        }

        // Create the task with all connections
        const task = await prisma.task.create({
            data: {
                ...taskData,
                ...connectData
            },
            include: {
                assignedUsers: true,
                createdBy: true,
                event: true,
                customer: true
            }
        });

        // Populate with Firebase user information
        const tasks = this.populateUserInformation([task]);
        return tasks[0];
    }

    /**
     * Update a task
     * @param {string} id - Task ID
     * @param {Object} data - Updated task data
     * @param {string[]} assignedUserIds - IDs of users assigned to the task
     */
    async update(id, data, assignedUserIds = []) {
        // Extract data that needs special handling
        const { assignedUserIds: dataUserIds, ...updateData } = data;

        // Use provided userIds or ones from the data
        const userIds = assignedUserIds.length > 0 ? assignedUserIds : (dataUserIds || []);

        // Handle completion data
        if (updateData.status === 'COMPLETED' && !updateData.completedAt) {
            updateData.completedAt = new Date();
        }

        // Handle user assignments if provided
        if (userIds) {
            // First delete existing assignments
            await prisma.task_User.deleteMany({
                where: { taskId: id }
            });

            // Then create new assignments if there are any users
            if (userIds.length > 0) {
                await Promise.all(userIds.map(uid =>
                    prisma.task_User.create({
                        data: {
                            task: { connect: { id } },
                            user: { connect: { id: uid } }
                        }
                    })
                ));
            }
        }

        // Handle completedBy connection if provided
        if (updateData.completedById) {
            updateData.completedBy = { connect: { id: updateData.completedById } };
            delete updateData.completedById;
        }

        // Convert string values to enum values
        if (updateData.type) {
            updateData.type = updateData.type.toUpperCase();
        }

        if (updateData.status) {
            updateData.status = updateData.status.toUpperCase();
        }

        if (updateData.priority) {
            updateData.priority = updateData.priority.toUpperCase();
        }

        // Update the task
        const task = await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                assignedUsers: true,
                createdBy: true,
                completedBy: true,
                event: true,
                customer: true
            }
        });

        // Populate with Firebase user information
        const tasks = await this.populateUserInformation([task]);
        return tasks[0];
    }

    /**
     * Delete a task
     * @param {string} id - Task ID
     */
    async delete(id) {
        // First delete all user assignments
        await prisma.task_User.deleteMany({
            where: { taskId: id }
        });

        // Then delete the task
        return prisma.task.delete({
            where: { id }
        });
    }

    /**
     * Get tasks statistics (counts by type, status, etc)
     */
    async getStats() {
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

        return stats;
    }

    /**
     * Get tasks assigned to a specific user
     * @param {string} userId - User ID
     */
    async getTasksByUser(userId) {
        const tasks = await prisma.task.findMany({
            where: {
                assignedUsers: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                assignedUsers: true,
                createdBy: true,
                completedBy: true,
                event: true,
                customer: true
            },
            orderBy: { dueDate: 'asc' }
        });

        return this.populateUserInformation(tasks);
    }

    /**
     * Helper method to populate Firebase user information for assigned users
     * @param {Array} tasks - Array of tasks with assignedUsers relations
     * @returns {Array} - Tasks with populated user information
     */
    async populateUserInformation(tasks) {
        if (!tasks || tasks.length === 0) return [];

        // Collect all unique user IDs from assigned users
        const userIds = new Set();
        tasks.forEach(task => {
            (task.assignedUsers || []).forEach(assignment => {
                userIds.add(assignment.userId);
            });

            if (task.createdById) {
                userIds.add(task.createdById);
            }

            if (task.completedById) {
                userIds.add(task.completedById);
            }
        });

        // If no user IDs, return tasks as is
        if (userIds.size === 0) {
            return tasks.map(task => ({
                ...task,
                assignedTo: []
            }));
        }

        try {
            // Get Firebase user records for these IDs
            const userRecords = await Promise.all(
                Array.from(userIds).map(async uid => {
                    try {
                        return await admin.auth().getUser(uid);
                    } catch (error) {
                        console.error(`Failed to fetch user ${uid}:`, error);
                        return {
                            uid,
                            displayName: 'Unknown User',
                            email: ''
                        };
                    }
                })
            );

            // Create a map of user IDs to display names
            const userMap = userRecords.reduce((map, user) => {
                map[user.uid] = user.displayName || user.email || 'Unknown User';
                return map;
            }, {});

            // Add user display names to tasks
            return tasks.map(task => {
                // Map assigned users to their display names
                const assignedTo = (task.assignedUsers || []).map(assignment =>
                    userMap[assignment.userId] || 'Unknown User'
                );

                // Get creator name
                const createdBy = task.createdById ? userMap[task.createdById] : null;

                // Get completer name
                const completedBy = task.completedById ? userMap[task.completedById] : null;

                // Keep the original assigned user IDs for the API
                const assignedUserIds = (task.assignedUsers || []).map(assignment => assignment.userId);

                return {
                    ...task,
                    assignedTo,
                    assignedUserIds,
                    createdByName: createdBy,
                    completedByName: completedBy
                };
            });
        } catch (error) {
            console.error('Error fetching user information:', error);
            // Return tasks without user information in case of error
            return tasks.map(task => ({
                ...task,
                assignedTo: (task.assignedUsers || []).map(() => 'Unknown User')
            }));
        }
    }
}

module.exports = new TaskRepository();