// backend/src/middleware/firebase-auth.js
const { admin } = require('../config/firebase');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

        // Check if user exists in database, if not create a placeholder record
        let dbUser = await prisma.user.findUnique({
            where: { id: decodedToken.uid }
        });

        if (!dbUser) {
            // Fetch user details from Firebase
            const firebaseUser = await admin.auth().getUser(decodedToken.uid);

            // Create placeholder user in database
            dbUser = await prisma.user.create({
                data: {
                    id: decodedToken.uid,
                    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    email: firebaseUser.email,
                    role: "USER", // Default role
                    isAdmin: false
                }
            });

            console.log('Created placeholder user record in database');
        }

        // Combine Firebase token data with database user data
        req.user = {
            ...decodedToken,
            role: dbUser.role,
            isAdmin: dbUser.isAdmin
        };

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

    // Check if user has admin flag
    if (req.user.isAdmin !== true) {
        return res.status(403).json({ error: 'Admin permission required' });
    }

    next();
};

/**
 * Middleware to verify specific role
 * This should be used after verifyFirebaseToken
 */
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role;

        // Role hierarchy: ADMIN > MANAGER > USER
        const roleHierarchy = {
            'ADMIN': 3,
            'MANAGER': 2,
            'USER': 1
        };

        // Check if user's role is >= the required role
        if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
            return res.status(403).json({
                error: `${requiredRole} permission required. You have ${userRole} permissions.`
            });
        }

        next();
    };
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

            // Get user role from database
            const dbUser = await prisma.user.findUnique({
                where: { id: decodedToken.uid }
            });

            // Combine token data with database role
            req.user = {
                ...decodedToken,
                role: dbUser?.role || 'USER',
                isAdmin: dbUser?.isAdmin || false
            };
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
    requireRole,
    optionalAuth
};