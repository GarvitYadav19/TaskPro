const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { createTask, getTasks, updateTask, deleteTask } = require("../controllers/taskController");

const router = express.Router();
router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin"),
  [
    body("title").notEmpty(),
    body("assignedTo").notEmpty(),
    body("projectId").notEmpty(),
    body("deadline").isISO8601(),
    body("priority").isIn(["high", "medium", "low"]),
    body("status").optional().isIn(["todo", "in-progress", "completed"])
  ],
  createTask
);
router.get("/", getTasks);
router.patch("/:id", updateTask);
router.delete("/:id", roleMiddleware("admin"), deleteTask);

module.exports = router;
