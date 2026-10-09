"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const publicProjectRoutes = require("./src/routes/publicProjectRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "";

const app = express();

/* ------------------------------------------------------------------ */
/* Required environment                                                */
/* ------------------------------------------------------------------ */
if (!process.env.JWT_SECRET) {
    console.error(
        "[config] JWT_SECRET is not set. Copy .env.example to .env and set JWT_SECRET " +
            "to a long random string before starting the server."
    );
    process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Global middleware                                                   */
/* ------------------------------------------------------------------ */
const allowedOrigins = CLIENT_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json({ limit: "100kb" }));

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
        message: "Portfolio API is running",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/public/projects", publicProjectRoutes);

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */
app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------ */
/* Start: connect to MongoDB first, listen only after it succeeds      */
/* ------------------------------------------------------------------ */
async function start() {
    try {
        const connection = await connectDB();
        console.log(`[db] MongoDB connected: ${connection.host}/${connection.name}`);

        app.listen(PORT, () => {
            console.log(`[server] Portfolio API listening on http://127.0.0.1:${PORT}`);
            console.log(`[server] Health check: GET http://127.0.0.1:${PORT}/api/health`);
        });
    } catch (err) {
        console.error("[db] MongoDB connection failed.");
        console.error(`[db] Reason: ${err.message}`);
        console.error(
            "[db] Check MONGODB_URI in .env — use mongodb://127.0.0.1:27017/portfolio_backend " +
                "for a local MongoDB instance, or your MongoDB Atlas SRV string."
        );
        process.exit(1);
    }
}

start();

module.exports = app;
