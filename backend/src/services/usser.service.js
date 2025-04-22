// backend/src/services/user.service.js
const { admin } = require('../config/firebase');
const prisma = require('./prisma.service');

class UserService {
    /**
     * Ensure a user exists in the database
     * If the user doesn't exist, create a placeholder record
     * @param {string} userId - Firebase user ID
     * @param {string} email - User email
     * @param {string} displayName - User display name
     */
    async ensureUserExists(userId, email, displayName = null) {
        try {
            console.log(`Checking if user ${userId} exists in database`);

            // Look for the user in the database
            let user = await prisma.user.findUnique({
                where: { id: userId }
            });

            // If user doesn't exist, create a new record
            if (!user) {
                console.log(`User ${userId} not found in database, creating new user record`);

                // Get user details from Firebase if available
                let firebaseUser = null;
                try {
                    firebaseUser = await admin.auth().getUser(userId);
                } catch (error) {
                    console.log(`Firebase user ${userId} not found:`, error.message);
                }

                // Create user in database
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        name: displayName || firebaseUser?.displayName || email.split('@')[0],
                        email: email,
                        role: 'USER',
                        isAdmin: false
                    }
                });

                console.log(`Created new user record for ${userId}`);
            }

            return user;
        } catch (error) {
            console.error(`Error ensuring user ${userId} exists:`, error);
            throw error;
        }
    }

    /**
     * Get all users from database
     */
    async getAllUsers() {
        try {
            console.log('Getting all users from database');

            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isAdmin: true
                }
            });

            console.log(`Retrieved ${users.length} users from database`);
            return users;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    /**
     * Get a user by ID
     * @param {string} userId - User ID
     */
    async getUserById(userId) {
        try {
            console.log(`Getting user ${userId} from database`);

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isAdmin: true
                }
            });

            if (!user) {
                console.log(`User ${userId} not found in database`);
                return null;
            }

            console.log(`Retrieved user ${userId} from database`);
            return user;
        } catch (error) {
            console.error(`Error getting user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Sync users from Firebase to the database
     * This is useful to run periodically to keep the database in sync
     */
    async syncFirebaseUsers() {
        try {
            console.log('Starting Firebase user sync');

            // Get all Firebase users
            const listUsersResult = await admin.auth().listUsers();
            console.log(`Retrieved ${listUsersResult.users.length} users from Firebase`);

            let createdCount = 0;
            let updatedCount = 0;

            // Process each Firebase user
            for (const firebaseUser of listUsersResult.users) {
                // Check if user exists in database
                let user = await prisma.user.findUnique({
                    where: { id: firebaseUser.uid }
                });

                if (user) {
                    // Update existing user
                    await prisma.user.update({
                        where: { id: firebaseUser.uid },
                        data: {
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                            email: firebaseUser.email
                        }
                    });
                    updatedCount++;
                } else {
                    // Create new user
                    await prisma.user.create({
                        data: {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                            email: firebaseUser.email,
                            role: 'USER',
                            isAdmin: false
                        }
                    });
                    createdCount++;
                }
            }

            console.log(`Firebase user sync complete: ${createdCount} users created, ${updatedCount} users updated`);
            return { created: createdCount, updated: updatedCount };
        } catch (error) {
            console.error('Error syncing Firebase users:', error);
            throw error;
        }
    }
}

module.exports = new UserService();