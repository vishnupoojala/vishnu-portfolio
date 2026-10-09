"use strict";

const mongoose = require("mongoose");

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 * Throws a descriptive error when the URI is missing or invalid so the
 * exact configuration problem can be reported at startup.
 */
async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error(
            "MONGODB_URI is missing. Copy .env.example to .env and set MONGODB_URI " +
                "to your local MongoDB instance (mongodb://127.0.0.1:27017/portfolio_backend) " +
                "or your MongoDB Atlas connection string."
        );
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(uri);

    return mongoose.connection;
}

module.exports = connectDB;
