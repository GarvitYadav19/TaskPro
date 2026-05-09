const seedDemoDataForAdmin = require("../utils/seedDemoData");

const seedDemo = async (req, res, next) => {
  try {
    await seedDemoDataForAdmin(req.user);
    return res.json({ message: "Demo data ready" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { seedDemo };
