"use strict";

const { validationResult } = require("express-validator");

/**
 * Runs the express-validator chains attached to the request.
 * Returns HTTP 400 with a structured error list when validation fails.
 */
function validate(req, res, next) {
    const result = validationResult(req);

    if (result.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.array().map((err) => ({
            field: err.path,
            message: err.msg,
        })),
    });
}

module.exports = { validate };
