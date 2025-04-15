// backend/src/middleware/firebase-auth.js
const { admin } = require('../config/firebase');

/**
 * Middleware to verify Firebase authentication token
 * This can be used to protect routes that require authentication
 */
const verifyFirebaseToken = async (req, res, next) => {
    console.log('Verifying Firebase token');

    // Get token from cookies first (preferred method)
    const idToken = req.cookies?.access_token;

    // Check authorization header as fallback
    const authHeader = req.headers.authorization;
    let headerToken;

    if (authHeader) {
        const [bearer, token] = authHeader.split(' ');
        if (bearer === 'Bearer' && token) {
            headerToken = token;
        }
    }

    // No token in either place
    if (!idToken && !headerToken) {
        console.log('No token provided in cookies or headers');
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    try {
        // Try cookie token first, then header token
        const token = idToken || headerToken;
        console.log('Found token, verifying...');

        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Token verified successfully for user:', decodedToken.uid);

        req.user = decodedToken;
        return next();
    } catch (error) {
        console.error('Error verifying token:', error);
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
    const cookieToken = req.cookies?.access_token;
    const authHeader = req.headers.authorization;

    if (!cookieToken && !authHeader) {
        return next();
    }

    try {
        let token;

        if (cookieToken) {
            token = cookieToken;
        } else if (authHeader) {
            const [bearer, authToken] = authHeader.split(' ');
            if (bearer === 'Bearer' && authToken) {
                token = authToken;
            }
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