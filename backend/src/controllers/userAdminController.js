// backend/src/controllers/userAdminController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { admin } = require('../config/firebase');

class UserAdminController {
    /**
     * Get all users (admin only)
     */
    async getAllUsers(req, res) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isAdmin: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: error.message || 'Failed to fetch users' });
        }
    }

    /**
     * Get a specific user by ID (admin only)
     */
    async getUserById(req, res) {
        const { id } = req.params;

        try {
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isAdmin: true,
                    createdAt: true,
                    updatedAt: true,
                    // Include related tasks if needed
                    assignedTasks: true,
                    tasksCreated: true,
                    tasksCompleted: true
                }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ message: error.message || 'Failed to fetch user' });
        }
    }

    /**
     * Update user role and admin status (admin only)
     */
    async updateUserRole(req, res) {
        const { id } = req.params;
        const { role, isAdmin } = req.body;

        // Validate role
        const validRoles = ['USER', 'MANAGER', 'ADMIN'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be USER, MANAGER, or ADMIN' });
        }

        try {
            // Update user in database
            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    role: role,
                    isAdmin: isAdmin === true, // Convert to boolean
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isAdmin: true
                }
            });

            // Also update Firebase custom claims to reflect role changes
            await admin.auth().setCustomUserClaims(id, {
                role: updatedUser.role,
                isAdmin: updatedUser.isAdmin
            });

            res.status(200).json({
                message: 'User role updated successfully',
                user: updatedUser
            });
        } catch (error) {
            console.error('Error updating user role:', error);

            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(500).json({ message: error.message || 'Failed to update user role' });
        }
    }

    /**
     * Delete a user (admin only)
     * This deletes from both PostgreSQL and Firebase
     */
    async deleteUser(req, res) {
        const { id } = req.params;

        try {
            // First delete from PostgreSQL
            await prisma.user.delete({
                where: { id }
            });

            // Then delete from Firebase
            await admin.auth().deleteUser(id);

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);

            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'User not found in database' });
            }

            if (error.code === 'auth/user-not-found') {
                return res.status(404).json({ message: 'User not found in Firebase' });
            }

            res.status(500).json({ message: error.message || 'Failed to delete user' });
        }
    }
}
//:3
module.exports = new UserAdminController();