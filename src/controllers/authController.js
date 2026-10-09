"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SALT_ROUNDS = 10;

function signToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
}

function publicUser(user) {
    return { id: user._id.toString(), name: user.name, email: user.email };
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({
            success: false,
            message: "An account with this email already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: publicUser(user),
    });
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const token = signToken(user._id);

    return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        token,
        tokenType: "Bearer",
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        user: publicUser(user),
    });
}

module.exports = { register, login };
