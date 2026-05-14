const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");

const buildTaskQuery = (user, query) => {
  const filter = user.role === "admin" ? {} : { assignedTo: user._id };
  if (query.mine === "true" || query.assignedTo === "me") {
    filter.assignedTo = user._id;
  }
  if (query.projectId) filter.projectId = query.projectId;
  if (query.priority) filter.priority = query.priority;
  if (query.status) filter.status = query.status;
  if (query.search) filter.title = { $regex: query.search, $options: "i" };
  return filter;
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await Project.findById(req.body.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id
    });
    await task.populate("assignedTo", "name email");
    await task.populate("projectId", "title");
    await task.populate("createdBy", "name email");
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const filter = buildTaskQuery(req.user, req.query);
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("projectId", "title")
      .populate("createdBy", "name email")
      .sort({ deadline: 1 });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember =
      req.user.role === "admin" ||
      project.members.some((m) => m.toString() === req.user._id.toString()) ||
      project.createdBy?.toString() === req.user._id.toString();
    if (!isMember) return res.status(403).json({ message: "Forbidden" });

    const filter = { projectId: req.params.projectId };
    if (req.query.mine === "true" || req.query.assignedTo === "me") {
      filter.assignedTo = req.user._id;
    }
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("projectId", "title")
      .populate("createdBy", "name email")
      .sort({ deadline: 1 });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(task, req.body);
    await task.save();
    await task.populate("assignedTo", "name email");
    await task.populate("projectId", "title");
    await task.populate("createdBy", "name email");
    return res.json(task);
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json({ message: "Task deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createTask, getTasks, getTasksByProject, updateTask, deleteTask };
