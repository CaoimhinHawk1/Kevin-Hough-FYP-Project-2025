const { admin } = require('../config/firebase');

/**
 * Middleware to verify Firebase authentication token
 * This can be used to protect routes that require authentication
 */
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists
    if (!authHeader) {
        // Check for token in cookies as a fallback
        const idToken = req.cookies?.access_token;
        if (!idToken) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.user = decodedToken;
            return next();
        } catch (error) {
            console.error('Error verifying token from cookie:', error);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    }

    // Extract the token from the Authorization header
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Invalid authorization format' });
    }

    try {
        // Verify the token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Add the decoded token to the request
        req.user = decodedToken;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Middleware to verify admin role
 * This should be used after verifyFirebaseToken
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin claim
    if (req.user.admin !== true) {
        return res.status(403).json({ error: 'Admin permission required' });
    }

    next();
};

/**
 * Optional authentication middleware
 * Will set req.user if a token is provided, but won't reject requests without tokens
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.access_token;

    if (!authHeader && !cookieToken) {
        return next();
    }

    try {
        let token;

        if (authHeader) {
            const [bearer, authToken] = authHeader.split(' ');
            if (bearer === 'Bearer' && authToken) {
                token = authToken;
            }
        } else if (cookieToken) {
            token = cookieToken;
        }

        if (token) {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
        }

        next();
    } catch (error) {
        // Just log the error but don't block the request
        console.error('Error in optional auth:', error);
        next();
    }
};

module.exports = {
    verifyFirebaseToken,
    requireAdmin,
    optionalAuth
};