const bcrypt = require("bcryptjs");
const User = require("../models/User");

const DEMO_PASSWORD = "Password123";

const DEMO_USERS = [
  {
    name: "Admin Demo",
    email: "admin@example.com",
    role: "admin"
  },
  {
    name: "Member Demo",
    email: "member@example.com",
    role: "member"
  }
];

const ensureDemoUsers = async () => {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  await Promise.all(
    DEMO_USERS.map(async (demoUser) => {
      const existing = await User.findOne({ email: demoUser.email });
      if (existing) return;

      await User.create({
        name: demoUser.name,
        email: demoUser.email,
        password: hashedPassword,
        role: demoUser.role
      });
    })
  );
};

module.exports = ensureDemoUsers;
