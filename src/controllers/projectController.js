"use strict";

const Project = require("../models/Project");

const WRITE_FIELDS = [
    "title",
    "description",
    "technologies",
    "githubUrl",
    "liveUrl",
    "featured",
];

function pickFields(body) {
    const data = {};
    for (const field of WRITE_FIELDS) {
        if (body[field] !== undefined) data[field] = body[field];
    }
    return data;
}

/**
 * POST /api/projects
 * The owner is always taken from the authenticated JWT, never from the body.
 */
async function createProject(req, res) {
    const project = await Project.create({
        ...pickFields(req.body),
        owner: req.user.id,
    });

    return res.status(201).json({
        success: true,
        message: "Project created",
        project,
    });
}

/**
 * GET /api/projects
 */
async function listProjects(req, res) {
    const projects = await Project.find({ owner: req.user.id })
        .sort({ featured: -1, createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        count: projects.length,
        projects,
    });
}

/**
 * GET /api/projects/:id
 */
async function getProject(req, res) {
    const project = await Project.findOne({
        _id: req.params.id,
        owner: req.user.id,
    }).lean();

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    return res.status(200).json({ success: true, project });
}

/**
 * PUT /api/projects/:id
 */
async function updateProject(req, res) {
    const data = pickFields(req.body);

    const project = await Project.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.id },
        { $set: data },
        { new: true, runValidators: true, context: "query" }
    );

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Project updated",
        project,
    });
}

/**
 * DELETE /api/projects/:id
 */
async function deleteProject(req, res) {
    const project = await Project.findOneAndDelete({
        _id: req.params.id,
        owner: req.user.id,
    });

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Project deleted",
        project,
    });
}

module.exports = {
    createProject,
    listProjects,
    getProject,
    updateProject,
    deleteProject,
};
