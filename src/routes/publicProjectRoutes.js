"use strict";

const express = require("express");

const Project = require("../models/Project");

const router = express.Router();

const PUBLIC_FIELDS =
    "title description technologies githubUrl liveUrl featured createdAt";

/**
 * GET /api/public/projects
 * Read-only and unauthenticated. Featured projects come first.
 * Owner IDs, emails and any other user data are never exposed.
 */
router.get("/", async (req, res, next) => {
    try {
        const projects = await Project.find()
            .select(PUBLIC_FIELDS)
            .sort({ featured: -1, createdAt: -1 })
            .limit(50)
            .lean();

        return res.status(200).json({
            success: true,
            count: projects.length,
            projects,
        });
    } catch (err) {
        return next(err);
    }
});

// The public API is read-only: no create, update or delete routes exist here.
module.exports = router;
