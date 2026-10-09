"use strict";

const mongoose = require("mongoose");

const URL_MESSAGE = "must be a valid http(s) URL, e.g. https://github.com/username/repo";

const projectSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"],
            index: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [2, "Title must be at least 2 characters"],
            maxlength: [120, "Title must be at most 120 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: [10, "Description must be at least 10 characters"],
            maxlength: [2000, "Description must be at most 2000 characters"],
        },
        technologies: {
            type: [String],
            required: [true, "Technologies are required"],
            validate: {
                validator(value) {
                    return Array.isArray(value) && value.length > 0;
                },
                message: "Technologies must be a non-empty array of strings",
            },
        },
        githubUrl: {
            type: String,
            trim: true,
            default: "",
            match: [/^$|^https?:\/\/\S+$/, `GitHub URL ${URL_MESSAGE}`],
        },
        liveUrl: {
            type: String,
            trim: true,
            default: "",
            match: [/^$|^https?:\/\/\S+$/, `Live URL ${URL_MESSAGE}`],
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: false },
    }
);

projectSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
