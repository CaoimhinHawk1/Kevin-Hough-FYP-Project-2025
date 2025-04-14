/**
 * Error handler middleware for Express
 * This should be registered after all routes
 */

// Custom error class for API errors
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isApiError = true;
    }

    static badRequest(message, details = null) {
        return new ApiError(400, message, details);
    }

    static unauthorized(message = 'Unauthorized', details = null) {
        return new ApiError(401, message, details);
    }

    static forbidden(message = 'Forbidden', details = null) {
        return new ApiError(403, message, details);
    }

    static notFound(message = 'Resource not found', details = null) {
        return new ApiError(404, message, details);
    }

    static conflict(message, details = null) {
        return new ApiError(409, message, details);
    }

    static internalServer(message = 'Internal server error', details = null) {
        return new ApiError(500, message, details);
    }
}

// Not found middleware - use for missing routes
const notFoundHandler = (req, res, next) => {
    next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error handler caught:', err);

    // Handle specific error types

    // API errors (our custom type)
    if (err.isApiError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                details: err.details,
                status: err.statusCode
            }
        });
    }

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: {
                message: 'Validation Error',
                details: err.errors.map(e => ({
                    field: e.path,
                    message: e.message
                })),
                status: 400
            }
        });
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: {
                message: 'Resource already exists',
                details: err.errors.map(e => ({
                    field: e.path,
                    message: e.message
                })),
                status: 409
            }
        });
    }

    // Firebase errors
    if (err.code && err.code.startsWith('auth/')) {
        return res.status(401).json({
            error: {
                message: err.message,
                code: err.code,
                status: 401
            }
        });
    }

    // Default error handling - don't expose details in production
    const isProduction = process.env.NODE_ENV === 'production';

    return res.status(500).json({
        error: {
            message: isProduction ? 'Internal server error' : err.message,
            stack: isProduction ? undefined : err.stack,
            status: 500
        }
    });
};

module.exports = {
    ApiError,
    notFoundHandler,
    errorHandler
};