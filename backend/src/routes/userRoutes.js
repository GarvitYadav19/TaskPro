const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", authMiddleware, getUsers);

module.exports = router;
