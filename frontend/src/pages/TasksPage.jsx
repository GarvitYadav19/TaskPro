import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import KanbanBoard from "../components/kanban/KanbanBoard";
import { roleLabel } from "../utils/ui";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState({ search: "", projectId: "", priority: "", status: "" });
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    projectId: "",
    priority: "medium",
    deadline: "",
    status: "todo"
  });
  const { user } = useAuth();

  const load = useCallback(async () => {
    const [t, p, u] = await Promise.all([api.get("/tasks", { params: filter }), api.get("/projects"), api.get("/users")]);
    setTasks(t.data);
    setProjects(p.data);
    setUsers(u.data);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      setMessage("");
      await api.post("/tasks", form);
      setForm({ title: "", description: "", assignedTo: "", projectId: "", priority: "medium", deadline: "", status: "todo" });
      setMessage("Task created successfully");
      load();
    } catch (error) {
      const apiError = error.response?.data;
      const validationError = Array.isArray(apiError?.errors) ? apiError.errors[0]?.msg : null;
      setMessage(validationError || apiError?.message || "Failed to create task");
    }
  };

  const moveTask = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status });
    load();
  };

  const seedDemo = async () => {
    await api.post("/seed/demo");
    setMessage("Demo members, project and tasks created");
    load();
  };

  const overdueCount = useMemo(
    () => tasks.filter((t) => t.status !== "completed" && new Date(t.deadline) < new Date()).length,
    [tasks]
  );

  return (
    <div className="space-y-5">
      <section className="premium-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Tasks Workspace</h2>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-600 dark:bg-rose-950/30">Overdue: {overdueCount}</span>
        </div>
        <div className="grid gap-2 md:grid-cols-5">
        <input className="premium-input md:col-span-2" placeholder="Search workspace..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
        <select className="premium-input" value={filter.projectId} onChange={(e) => setFilter({ ...filter, projectId: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        <select className="premium-input" value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
          <option value="">All Priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <select className="premium-input" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option><option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
        </select>
        </div>
      </section>

      {user?.role === "admin" && (
        <form className="premium-card p-5" onSubmit={createTask}>
          <h3 className="mb-3 text-xl font-semibold">Create New Task</h3>
          {projects.length === 0 && (
            <div className="mb-3 rounded-xl bg-amber-50/80 p-3 text-sm text-amber-700 dark:bg-amber-950/35 dark:text-amber-300">
              No project found. Create one in Projects page or
              <button type="button" onClick={seedDemo} className="ml-1 font-semibold underline">
                load demo data
              </button>
              .
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
          <input className="premium-input" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="premium-input" placeholder="Task description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="premium-input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">Select project</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <select className="premium-input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Assign member</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name} ({roleLabel(u.role)})</option>)}
          </select>
          <input className="premium-input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <select className="premium-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <button className="primary-btn">Create Task</button>
          </div>
          {message && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{message}</p>}
        </form>
      )}

      <KanbanBoard tasks={tasks} onMove={moveTask} />
    </div>
  );
};

export default TasksPage;
