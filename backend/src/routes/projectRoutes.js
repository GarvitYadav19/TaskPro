const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require("../controllers/projectController");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin"),
  [body("title").notEmpty().withMessage("Project title is required")],
  createProject
);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.patch("/:id", roleMiddleware("admin"), updateProject);
router.delete("/:id", roleMiddleware("admin"), deleteProject);

module.exports = router;
