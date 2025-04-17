// backend/src/controllers/authController.js
const {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithCredential,
    GoogleAuthProvider,
    admin
} = require('../config/firebase');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = getAuth();

/**
 * Controller handling Firebase authentication operations with database integration
 */
class AuthController {
    /**
     * Register a new user and create corresponding database record
     */
    async registerUser(req, res) {
        const { email, password, displayName } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        try {
            // Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update display name if provided
            if (displayName && firebaseUser) {
                await admin.auth().updateUser(firebaseUser.uid, { displayName });
            }

            // Create user record in the database with default role
            const dbUser = await prisma.user.create({
                data: {
                    id: firebaseUser.uid,
                    name: displayName || email.split('@')[0],
                    email: firebaseUser.email,
                    role: "USER", // Default role
                    isAdmin: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Send email verification
            await sendEmailVerification(userCredential.user);

            // Generate authentication token
            const token = await userCredential.user.getIdToken();

            // Set token in a cookie
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 hour
            });

            // Return user data (don't include sensitive information)
            res.status(201).json({
                message: "User created successfully! Verification email sent.",
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    emailVerified: userCredential.user.emailVerified,
                    displayName: displayName || null,
                    role: dbUser.role,
                    isAdmin: dbUser.isAdmin
                }
            });
        } catch (error) {
            console.error("Registration error:", error);

            // Handle specific Firebase errors
            if (error.code === 'auth/email-already-in-use') {
                return res.status(409).json({ message: "Email is already in use" });
            } else if (error.code === 'auth/weak-password') {
                return res.status(400).json({ message: "Password is too weak" });
            }

            res.status(500).json({ message: error.message || "Failed to register user" });
        }
    }

    /**
     * Log in an existing user and fetch their database role
     */
    async loginUser(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        try {
            // Sign in with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Get the ID token
            const token = await firebaseUser.getIdToken();

            // Fetch user from database to get role information
            let dbUser = await prisma.user.findUnique({
                where: { id: firebaseUser.uid }
            });

            // Create user in database if they don't exist (might happen if they were created directly in Firebase)
            if (!dbUser) {
                dbUser = await prisma.user.create({
                    data: {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || email.split('@')[0],
                        email: firebaseUser.email,
                        role: "USER", // Default role
                        isAdmin: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            }

            // Update Firebase custom claims with user role
            await admin.auth().setCustomUserClaims(firebaseUser.uid, {
                role: dbUser.role,
                isAdmin: dbUser.isAdmin
            });

            // Set token in a cookie
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 hour
            });

            // Return user data with role information
            res.status(200).json({
                message: "Login successful",
                user: {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    emailVerified: firebaseUser.emailVerified,
                    displayName: firebaseUser.displayName,
                    role: dbUser.role,
                    isAdmin: dbUser.isAdmin
                }
            });
        } catch (error) {
            console.error("Login error:", error);

            // Handle specific Firebase errors
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                return res.status(401).json({ message: "Invalid email or password" });
            } else if (error.code === 'auth/too-many-requests') {
                return res.status(429).json({ message: "Too many unsuccessful login attempts. Please try again later" });
            }

            res.status(500).json({ message: error.message || "Failed to log in" });
        }
    }

    /**
     * Google login/signup with database integration
     */
    async googleLogin(req, res) {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: "Google ID token is required"
            });
        }

        try {
            // Create a credential from the Google ID token
            const credential = GoogleAuthProvider.credential(idToken);

            // Sign in with the credential
            const userCredential = await signInWithCredential(auth, credential);
            const firebaseUser = userCredential.user;

            // Check if user exists in database
            let dbUser = await prisma.user.findUnique({
                where: { id: firebaseUser.uid }
            });

            // Create user in database if they don't exist
            if (!dbUser) {
                dbUser = await prisma.user.create({
                    data: {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        email: firebaseUser.email,
                        role: "USER", // Default role
                        isAdmin: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            }

            // Update Firebase custom claims with user role
            await admin.auth().setCustomUserClaims(firebaseUser.uid, {
                role: dbUser.role,
                isAdmin: dbUser.isAdmin
            });

            // Generate authentication token
            const token = await firebaseUser.getIdToken(true); // Force refresh to include custom claims

            // Set token in a cookie
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 hour
            });

            // Return user data
            res.status(200).json({
                message: "Google login successful",
                user: {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    emailVerified: firebaseUser.emailVerified,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    role: dbUser.role,
                    isAdmin: dbUser.isAdmin
                }
            });
        } catch (error) {
            console.error("Google login error:", error);
            res.status(401).json({ message: error.message || "Failed to authenticate with Google" });
        }
    }

    /**
     * Get current user info with their role from database
     */
    async getCurrentUser(req, res) {
        try {
            // If middleware has attached the user to the request
            if (req.user) {
                // Fetch user from database to get role information
                const dbUser = await prisma.user.findUnique({
                    where: { id: req.user.uid }
                });

                // Combine Firebase user info with database info
                res.status(200).json({
                    user: {
                        uid: req.user.uid,
                        email: req.user.email,
                        emailVerified: req.user.email_verified,
                        displayName: req.user.name,
                        role: dbUser ? dbUser.role : 'USER',
                        isAdmin: dbUser ? dbUser.isAdmin : false
                    }
                });
            } else {
                res.status(401).json({ message: "Not authenticated" });
            }
        } catch (error) {
            console.error("Get current user error:", error);
            res.status(500).json({ message: error.message || "Failed to get user information" });
        }
    }

    // Other methods remain the same
    async logoutUser(req, res) {
        try {
            // Clear the auth cookie
            res.clearCookie('access_token');
            res.status(200).json({ message: "Logout successful" });
        } catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({ message: error.message || "Failed to log out" });
        }
    }

    async resetPassword(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        try {
            await sendPasswordResetEmail(auth, email);
            res.status(200).json({ message: "Password reset email sent" });
        } catch (error) {
            console.error("Password reset error:", error);

            // For security reasons, still return success to prevent email enumeration
            if (error.code === 'auth/user-not-found') {
                return res.status(200).json({ message: "If the email exists, a password reset link has been sent" });
            }

            res.status(500).json({ message: "Failed to send password reset email" });
        }
    }
}

module.exports = new AuthController();