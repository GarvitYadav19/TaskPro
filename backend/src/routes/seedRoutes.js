const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { seedDemo } = require("../controllers/seedController");

const router = express.Router();

router.post("/seed/demo", authMiddleware, roleMiddleware("admin"), seedDemo);

module.exports = router;
