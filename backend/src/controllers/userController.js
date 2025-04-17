// backend/src/controllers/userController.js
const { admin } = require('../config/firebase');
const { ApiError } = require('../middleware/error-handler');

/**
 * Get all users from Firebase
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        // Check if the requesting user is authenticated
        if (!req.user) {
            return next(ApiError.unauthorized('You must be logged in to access user data'));
        }

        // Option to limit the number of users returned
        const maxResults = parseInt(req.query.maxResults) || 1000;

        // Get all users from Firebase Auth
        const listUsersResult = await admin.auth().listUsers(maxResults);

        // Transform the user data to match what the frontend expects
        const users = listUsersResult.users.map(user => ({
            uid: user.uid,
            displayName: user.displayName || 'Unknown User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            // Add custom claims if available (e.g., isAdmin)
            isAdmin: user.customClaims?.isAdmin || false
        }));

        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        next(err);
    }
};

/**
 * Get a specific user from Firebase
 */
exports.getUserById = async (req, res, next) => {
    try {
        // Check if the requesting user is authenticated
        if (!req.user) {
            return next(ApiError.unauthorized('You must be logged in to access user data'));
        }

        const userId = req.params.id;

        // Get the user from Firebase Auth
        const userRecord = await admin.auth().getUser(userId);

        // Transform the user data to match what the frontend expects
        const user = {
            uid: userRecord.uid,
            displayName: userRecord.displayName || 'Unknown User',
            email: userRecord.email || '',
            photoURL: userRecord.photoURL || '',
            // Add custom claims if available
            isAdmin: userRecord.customClaims?.isAdmin || false
        };

        res.status(200).json(user);
    } catch (err) {
        console.error(`Error fetching user ${req.params.id}:`, err);

        // Handle specific Firebase auth errors
        if (err.code === 'auth/user-not-found') {
            return next(ApiError.notFound('User not found'));
        }

        next(err);
    }
};