"use strict";

const express = require("express");
const { body, param } = require("express-validator");

const {
    createProject,
    listProjects,
    getProject,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

const idRules = [
    param("id").isMongoId().withMessage("Invalid project id"),
];

const urlRule = (label) =>
    body(label)
        .optional({ values: "falsy" })
        .trim()
        .isURL({ protocols: ["http", "https"], require_protocol: true, require_tld: true })
        .withMessage(`${label} must be a valid http(s) URL`);

const featuredRule = body("featured")
    .optional({ values: "falsy" })
    .isBoolean()
    .withMessage("featured must be a boolean")
    .toBoolean();

const createRules = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 2, max: 120 })
        .withMessage("Title must be between 2 and 120 characters"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),
    body("technologies")
        .isArray({ min: 1 })
        .withMessage("technologies must be a non-empty array of strings"),
    body("technologies.*")
        .isString()
        .withMessage("each technology must be a string")
        .trim()
        .notEmpty()
        .withMessage("technologies cannot contain empty values"),
    urlRule("githubUrl"),
    urlRule("liveUrl"),
    featuredRule,
];

const updateRules = [
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ min: 2, max: 120 })
        .withMessage("Title must be between 2 and 120 characters"),
    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),
    body("technologies")
        .optional()
        .isArray({ min: 1 })
        .withMessage("technologies must be a non-empty array of strings"),
    body("technologies.*")
        .optional()
        .isString()
        .withMessage("each technology must be a string")
        .trim()
        .notEmpty()
        .withMessage("technologies cannot contain empty values"),
    urlRule("githubUrl"),
    urlRule("liveUrl"),
    featuredRule,
    body().custom((value) => {
        const allowed = [
            "title",
            "description",
            "technologies",
            "githubUrl",
            "liveUrl",
            "featured",
        ];
        const provided = allowed.filter((field) => value[field] !== undefined);
        if (provided.length === 0) {
            throw new Error("Provide at least one field to update");
        }
        return true;
    }),
];

// Every route requires a valid JWT
router.use(protect);

router.post("/", createRules, validate, createProject);
router.get("/", listProjects);
router.get("/:id", idRules, validate, getProject);
router.put("/:id", [...idRules, ...updateRules], validate, updateProject);
router.delete("/:id", idRules, validate, deleteProject);

module.exports = router;
