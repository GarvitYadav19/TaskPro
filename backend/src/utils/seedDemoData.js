const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const bcrypt = require("bcryptjs");

const seedDemoDataForAdmin = async (adminUser) => {
  const existingProjectCount = await Project.countDocuments({ createdBy: adminUser._id });
  if (existingProjectCount > 0) return;

  const demoUsersPayload = [
    { name: "Alex Rivera", email: "alex.member@taskpro.local", password: "demo1234", role: "member" },
    { name: "Priya Mehta", email: "priya.member@taskpro.local", password: "demo1234", role: "member" }
  ];

  const demoUsers = [];
  for (const payload of demoUsersPayload) {
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      const hashed = await bcrypt.hash(payload.password, 10);
      user = await User.create({ ...payload, password: hashed });
    }
    demoUsers.push(user);
  }

  const project = await Project.create({
    title: "Mobile App Redesign",
    description: "Improve UX flows and dashboard visual consistency.",
    members: [adminUser._id, ...demoUsers.map((u) => u._id)],
    createdBy: adminUser._id
  });

  const today = new Date();
  const plusDays = (days) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

  await Task.insertMany([
    {
      title: "Create dashboard wireframes",
      description: "Prepare responsive wireframes for dashboard and projects pages.",
      assignedTo: demoUsers[0]._id,
      projectId: project._id,
      priority: "high",
      deadline: plusDays(3),
      status: "todo",
      createdBy: adminUser._id
    },
    {
      title: "Set up KPI analytics cards",
      description: "Build animated KPI cards and responsive chart blocks.",
      assignedTo: demoUsers[1]._id,
      projectId: project._id,
      priority: "medium",
      deadline: plusDays(5),
      status: "in-progress",
      createdBy: adminUser._id
    }
  ]);
};

module.exports = seedDemoDataForAdmin;
