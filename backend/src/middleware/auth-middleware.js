// backend/src/middleware/auth-middleware.js
const jwt = require('jsonwebtoken');
const { ApiError } = require('./error-handler');

// JWT secret - should be in .env
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

exports.verifyToken = (req, res, next) => {
    // Get token from cookie
    const token = req.cookies.auth_token;

    if (!token) {
        return next(ApiError.unauthorized('Authentication required'));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user data to request
        req.user = decoded;
        next();
    } catch (error) {
        return next(ApiError.unauthorized('Invalid or expired token'));
    }
};

exports.optionalAuth = (req, res, next) => {
    // Get token from cookie
    const token = req.cookies.auth_token;

    if (!token) {
        return next(); // Continue without authentication
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user data to request
        req.user = decoded;
        next();
    } catch (error) {
        // Invalid token, but continue anyway
        next();
    }
};