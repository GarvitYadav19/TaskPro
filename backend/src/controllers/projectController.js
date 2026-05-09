const { validationResult } = require("express-validator");
const Project = require("../models/Project");
const Task = require("../models/Task");

const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, members = [] } = req.body;
    const project = await Project.create({
      title,
      description,
      members: [...new Set([req.user._id.toString(), ...members])],
      createdBy: req.user._id
    });
    return res.status(201).json(project);
  } catch (error) {
    return next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { members: req.user._id };
    const projects = await Project.find(query).populate("members", "name email role").sort("-createdAt");
    return res.json(projects);
  } catch (error) {
    return next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "members",
      "name email role"
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (error) {
    return next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    await Task.deleteMany({ projectId: req.params.id });
    return res.json({ message: "Project deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createProject, getProjects, updateProject, deleteProject };
