// backend/src/services/firebase-auth.service.js
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json'); // Your service account key

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

class FirebaseAuthService {
    // Authenticate with email/password and return a token
    async loginWithEmail(email, password) {
        try {
            // Use Firebase Admin to create a custom token
            const uid = await this.getUserIdByEmail(email);
            if (!uid) {
                throw new Error('User not found');
            }

            // Verify password (you'll need a secure way to do this)
            // This is simplified - in production, you'd have password verification

            // Create a custom token
            const token = await admin.auth().createCustomToken(uid);

            // Get user details
            const userRecord = await admin.auth().getUser(uid);

            return {
                token,
                user: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    emailVerified: userRecord.emailVerified
                }
            };
        } catch (error) {
            console.error('Error logging in with email:', error);
            throw error;
        }
    }

    // Get user ID by email (helper method)
    async getUserIdByEmail(email) {
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            return userRecord.uid;
        } catch (error) {
            console.error('Error getting user by email:', error);
            return null;
        }
    }

    // Verify a token
    async verifyToken(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return decodedToken;
        } catch (error) {
            console.error('Error verifying token:', error);
            throw error;
        }
    }

    // Create a new user
    async createUser(email, password, displayName) {
        try {
            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName,
                emailVerified: false
            });

            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            const link = await admin.auth().generatePasswordResetLink(email);
            // In a real app, you would send an email with this link
            return { link };
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
}

module.exports = new FirebaseAuthService();