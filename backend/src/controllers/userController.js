const User = require("../models/User");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("name email role").sort({ name: 1 });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getUsers };
