const Task = require("../models/Task");

const isOverdue = (task) => task.status !== "completed" && new Date(task.deadline) < new Date();

const getDashboardStats = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(filter).populate("assignedTo", "name");

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const overdue = tasks.filter(isOverdue).length;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyMap = new Map(days.map((d) => [d, 0]));
    tasks
      .filter((t) => t.status === "completed")
      .forEach((task) => {
        weeklyMap.set(days[new Date(task.updatedAt).getDay()], weeklyMap.get(days[new Date(task.updatedAt).getDay()]) + 1);
      });

    const memberMap = new Map();
    tasks
      .filter((t) => t.status === "completed" && t.assignedTo)
      .forEach((task) => {
        const name = task.assignedTo.name;
        memberMap.set(name, (memberMap.get(name) || 0) + 1);
      });

    const recentActivity = tasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6)
      .map((t) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        at: t.updatedAt
      }));

    return res.json({
      kpis: { total, completed, inProgress, todo, overdue },
      statusDistribution: [
        { name: "Todo", value: todo },
        { name: "In Progress", value: inProgress },
        { name: "Completed", value: completed },
        { name: "Overdue", value: overdue }
      ],
      weeklyProductivity: Array.from(weeklyMap.entries()).map(([day, completedTasks]) => ({
        day,
        completedTasks
      })),
      teamPerformance: Array.from(memberMap.entries()).map(([member, completedTasks]) => ({
        member,
        completedTasks
      })),
      recentActivity
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboardStats };
