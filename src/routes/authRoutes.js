"use strict";

const express = require("express");
const { body } = require("express-validator");

const { register, login } = require("../controllers/authController");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

/**
 * POST /api/auth/register
 * { name, email, password }
 */
router.post(
    "/register",
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 2, max: 60 })
            .withMessage("Name must be between 2 and 60 characters"),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("A valid email address is required")
            .normalizeEmail(),
        body("password")
            .isString()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters")
            .matches(/\S/)
            .withMessage("Password cannot consist only of whitespace"),
    ],
    validate,
    register
);

/**
 * POST /api/auth/login
 * { email, password }
 */
router.post(
    "/login",
    [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("A valid email address is required")
            .normalizeEmail(),
        body("password")
            .isString()
            .withMessage("Password is required")
            .notEmpty()
            .withMessage("Password is required"),
    ],
    validate,
    login
);

module.exports = router;
