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

const auth = getAuth();

/**
 * Controller handling Firebase authentication operations
 */
class AuthController {
    /**
     * Register a new user
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
            const user = userCredential.user;

            // Update display name if provided
            if (displayName && user) {
                await admin.auth().updateUser(user.uid, { displayName });
            }

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
                    displayName: displayName || null
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
     * Log in an existing user
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

            // Get the ID token
            const token = await userCredential.user.getIdToken();

            // Set token in a cookie
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 hour
            });

            // Return user data (don't include sensitive information)
            res.status(200).json({
                message: "Login successful",
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    emailVerified: userCredential.user.emailVerified,
                    displayName: userCredential.user.displayName
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
     * Log out the current user
     */
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

    /**
     * Send password reset email
     */
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

            // Handle specific Firebase errors
            if (error.code === 'auth/user-not-found') {
                // For security reasons, still return success to prevent email enumeration
                return res.status(200).json({ message: "If the email exists, a password reset link has been sent" });
            }

            res.status(500).json({ message: "Failed to send password reset email" });
        }
    }

    /**
     * Get current user info
     */
    async getCurrentUser(req, res) {
        try {
            // If middleware has attached the user to the request
            if (req.user) {
                res.status(200).json({
                    user: {
                        uid: req.user.uid,
                        email: req.user.email,
                        emailVerified: req.user.email_verified,
                        displayName: req.user.name
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

    /**
     * Authenticate with Google
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

            // Generate authentication token
            const token = await userCredential.user.getIdToken();

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
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    emailVerified: userCredential.user.emailVerified,
                    displayName: userCredential.user.displayName,
                    photoURL: userCredential.user.photoURL
                }
            });
        } catch (error) {
            console.error("Google login error:", error);
            res.status(401).json({ message: error.message || "Failed to authenticate with Google" });
        }
    }
}

module.exports = new AuthController();