const Task = require("../models/Task");
const Project = require("../models/Project");

const isOverdue = (task) => task.status !== "completed" && new Date(task.deadline) < new Date();

const daysOverdue = (task) => {
  if (task.status === "completed") return 0;
  const d = new Date(task.deadline);
  if (d >= new Date()) return 0;
  return Math.ceil((Date.now() - d) / 86400000);
};

const getDashboardStats = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(filter).populate("assignedTo", "name").populate("projectId", "title");

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
        const day = days[new Date(task.updatedAt).getDay()];
        weeklyMap.set(day, weeklyMap.get(day) + 1);
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

    const now = new Date();
    const priorityLane = tasks
      .filter((t) => t.status !== "completed" && t.priority === "high")
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5)
      .map((t) => ({
        id: t._id,
        title: t.title,
        projectId: t.projectId?._id || t.projectId,
        projectTitle: t.projectId?.title || "Project",
        priority: t.priority,
        overdueDays: daysOverdue(t),
        deadline: t.deadline
      }));

    const overdueList = tasks
      .filter(isOverdue)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6)
      .map((t) => ({
        id: t._id,
        title: t.title,
        projectId: t.projectId?._id || t.projectId,
        projectTitle: t.projectId?.title || "",
        deadline: t.deadline
      }));

    const upcomingDueDates = tasks
      .filter((t) => t.status !== "completed" && new Date(t.deadline) >= now)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6)
      .map((t) => ({
        id: t._id,
        title: t.title,
        projectId: t.projectId?._id || t.projectId,
        projectTitle: t.projectId?.title || "",
        deadline: t.deadline
      }));

    const projectQuery = req.user.role === "admin" ? {} : { members: req.user._id };
    const projects = await Project.find(projectQuery).populate("members", "name role").sort("-updatedAt").limit(6);

    const projectIds = projects.map((p) => p._id);
    const allProjectTasks =
      projectIds.length > 0 ? await Task.find({ projectId: { $in: projectIds } }) : [];

    const recentProjects = projects.map((p) => {
      const pTasks = allProjectTasks.filter((t) => String(t.projectId) === String(p._id));
      const done = pTasks.filter((t) => t.status === "completed").length;
      const pOverdue = pTasks.filter(isOverdue).length;
      const pending = pTasks.filter((t) => t.status !== "completed");
      const nextDueTask = pending
        .filter((t) => new Date(t.deadline) >= now)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
      const completion = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
      const userMember = (p.members || []).find((m) => (m._id || m).toString() === req.user._id.toString());
      const roleBadge = req.user.role === "admin" ? "Admin" : userMember?.role === "admin" ? "Admin" : "Member";

      return {
        id: p._id,
        title: p.title,
        description: p.description || "",
        roleBadge,
        tasksTotal: pTasks.length,
        completed: done,
        members: (p.members || []).length,
        overdue: pOverdue,
        completion,
        nextDue: nextDueTask ? new Date(nextDueTask.deadline) : null,
        updatedAt: p.updatedAt
      };
    });

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
      recentActivity,
      workload: { todo, inProgress, completed, total },
      priorityLane,
      overdueList,
      upcomingDueDates,
      recentProjects
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboardStats };
