"use strict";

/**
 * 404 handler for unknown API routes.
 */
function notFound(req, res) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

/**
 * Central error handler. Converts Mongoose, JWT and body-parser errors
 * into safe JSON responses and hides stack traces from clients.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    // Malformed JSON body
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Malformed JSON in request body",
        });
    }

    // Mongoose schema validation
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors || {}).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    // Invalid MongoDB ObjectId cast
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid value for '${err.path}': ${err.value} is not a valid identifier`,
        });
    }

    // Duplicate unique index (e.g. email already registered)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res.status(409).json({
            success: false,
            message: `A record with that ${field} already exists`,
        });
    }

    // JWT problems that were not caught by the auth middleware
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please log in again.",
        });
    }

    const status = Number(err.statusCode || err.status) || 500;

    if (status >= 500) {
        console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }

    return res.status(status).json({
        success: false,
        message: err.message || "Request failed",
    });
}

module.exports = { notFound, errorHandler };
