"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * JWT authentication middleware.
 * Expects:  Authorization: Bearer <token>
 * Attaches  req.user = { id, name, email }  for downstream handlers.
 * Every failure returns HTTP 401 with a safe JSON message.
 */
async function protect(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const [scheme, token] = header.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Send 'Authorization: Bearer <token>'.",
            });
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            const message =
                err.name === "TokenExpiredError"
                    ? "Token expired. Please log in again."
                    : "Invalid or malformed token. Please log in again.";
            return res.status(401).json({ success: false, message });
        }

        const user = await User.findById(payload.userId).select("name email");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "The account linked to this token no longer exists.",
            });
        }

        req.user = { id: user._id.toString(), name: user.name, email: user.email };
        return next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed. Please log in again.",
        });
    }
}

module.exports = { protect };
