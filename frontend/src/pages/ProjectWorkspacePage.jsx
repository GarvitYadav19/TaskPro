import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getInitials, roleLabel } from "../utils/ui";

const columns = [
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "completed", label: "Done" }
];

const priorityClass = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
};

const fmt = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

const ProjectWorkspacePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("board");
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState("");
  const [fPriority, setFPriority] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    deadline: "",
    assignedTo: ""
  });

  const loadProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data);
    } catch {
      navigate("/projects", { replace: true });
    }
  }, [projectId, navigate]);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadTasks = useCallback(async () => {
    const params = {};
    if (mine) params.mine = "true";
    if (debouncedSearch) params.search = debouncedSearch;
    if (fPriority) params.priority = fPriority;
    if (fStatus) params.status = fStatus;
    const { data } = await api.get(`/tasks/project/${projectId}`, { params });
    setTasks(data);
  }, [projectId, mine, debouncedSearch, fPriority, fStatus]);

  const loadUsers = useCallback(async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  }, []);

  useEffect(() => {
    loadProject();
    loadUsers();
  }, [loadProject, loadUsers]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProg = tasks.filter((t) => t.status === "in-progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const overdue = tasks.filter((t) => t.status !== "completed" && new Date(t.deadline) < new Date()).length;
    const high = tasks.filter((t) => t.priority === "high" && t.status !== "completed").length;
    const completion = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProg, todo, overdue, high, completion };
  }, [tasks]);

  const filteredCount = tasks.length;

  const createTask = async (e) => {
    e.preventDefault();
    if (user?.role !== "admin") return;
    try {
      setMsg("");
      await api.post("/tasks", {
        ...form,
        projectId,
        deadline: form.deadline ? new Date(`${form.deadline}T12:00:00`).toISOString() : form.deadline
      });
      setForm({ title: "", description: "", priority: "medium", status: "todo", deadline: "", assignedTo: "" });
      setMsg("Task created");
      loadTasks();
    } catch (err) {
      const apiError = err.response?.data;
      setMsg(apiError?.message || "Could not create task");
    }
  };

  const patchTask = async (id, body) => {
    await api.patch(`/tasks/${id}`, body);
    loadTasks();
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    loadTasks();
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    await api.patch(`/tasks/${editing._id}`, {
      title: editing.title,
      description: editing.description,
      priority: editing.priority,
      status: editing.status,
      deadline: editing.deadline ? new Date(`${String(editing.deadline).slice(0, 10)}T12:00:00`).toISOString() : editing.deadline,
      assignedTo: editing.assignedTo?._id || editing.assignedTo
    });
    setEditing(null);
    loadTasks();
  };

  if (!project) {
    return (
      <div className="premium-card p-8 text-center text-slate-600 dark:text-slate-300">
        Loading project…
      </div>
    );
  }

  const tabBtn = (id, label) => (
    <button
      type="button"
      key={id}
      onClick={() => setTab(id)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        tab === id
          ? "bg-gradient-to-r from-teal-600 to-emerald-700 text-white shadow-lg shadow-teal-500/20"
          : "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600/90 dark:text-teal-300/90">Delivery workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{project.description || "Project workspace for tasks, filters, and delivery."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">
            {roleLabel(user?.role)}
          </span>
          <Link
            to="/projects"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Back to projects
          </Link>
        </div>
      </div>

      <div className="premium-card overflow-hidden p-5 ring-1 ring-slate-200/90 dark:ring-slate-700/45 md:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              Live project pulse
            </span>
            <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
              One place for planning, assignment, collaboration, and delivery control.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Track ownership, deadlines, and status in a focused board. Updates stay scoped to this project only.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm ring-1 ring-slate-200/60 dark:border-slate-600 dark:bg-slate-900/40 dark:ring-slate-600/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completion</p>
                <p className="mt-1 text-xl font-bold text-teal-700 dark:text-teal-300">{stats.completion}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm ring-1 ring-slate-200/60 dark:border-slate-600 dark:bg-slate-900/40 dark:ring-slate-600/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overdue</p>
                <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-300">{stats.overdue}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm ring-1 ring-slate-200/60 dark:border-slate-600 dark:bg-slate-900/40 dark:ring-slate-600/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Team</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{(project.members || []).length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/95 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur dark:border-slate-700 dark:bg-slate-900/40 dark:ring-slate-600/40">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>Project progress</span>
              <span>{stats.completion}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${stats.completion}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2">
              {[
                { k: "Tasks", v: stats.total },
                { k: "High priority", v: stats.high },
                { k: "Admins", v: (project.members || []).filter((m) => m.role === "admin").length },
                { k: "Updated", v: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "—" }
              ].map((cell) => (
                <div key={cell.k} className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/50 dark:ring-slate-600/30">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{cell.k}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{cell.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">{tabBtn("board", "Board")}{tabBtn("members", "Members")}</div>

      {tab === "members" && (
        <div className="premium-card p-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Members</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(project.members || []).map((m) => (
              <div key={m._id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm ring-1 ring-slate-200/60 dark:border-slate-600 dark:bg-slate-900/45 dark:ring-slate-600/30">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold dark:bg-slate-700">{getInitials(m.name)}</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase dark:bg-slate-800">{roleLabel(m.role)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* {tab === "settings" && (
        <div className="premium-card p-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Project preferences and advanced controls can be extended here. Core delivery workflows stay on the Board tab.</p>
        </div>
      )} */}

      {tab === "board" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "To do", n: stats.todo, d: "Planned work waiting to move." },
              { k: "In progress", n: stats.inProg, d: "Active tasks currently in flight." },
              { k: "Done", n: stats.completed, d: "Completed tasks delivering value already." },
              { k: "Filtered view", n: filteredCount, d: "Tasks matching your current board filters." }
            ].map((c) => (
              <motion.div key={c.k} whileHover={{ y: -2 }} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-md ring-1 ring-slate-200/70 backdrop-blur dark:border-slate-600 dark:bg-slate-900/45 dark:ring-slate-600/30">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{c.k}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{c.n}</p>
                <p className="mt-1 text-xs text-slate-500">{c.d}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {user?.role === "admin" && (
              <form className="premium-card space-y-3 p-5" onSubmit={createTask}>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create and assign work</h3>
                <input className="premium-input w-full" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea className="premium-input min-h-[88px] w-full" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <select className="premium-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select className="premium-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Done</option>
                  </select>
                  <input className="premium-input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
                  <select className="premium-input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required>
                    <option value="">Assignee</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="primary-btn w-full sm:w-auto">
                  Create task
                </button>
                {msg && <p className="text-sm text-slate-600 dark:text-slate-300">{msg}</p>}
              </form>
            )}

            <div className="premium-card space-y-3 p-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Board filters</h3>
              <input className="premium-input w-full" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="grid gap-2 sm:grid-cols-2">
                <select className="premium-input" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                  <option value="">All status</option>
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Done</option>
                </select>
                <select className="premium-input" value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
                  <option value="">All priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-teal-600" />
                Show only my tasks
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {columns.map((col) => (
              <div
                key={col.key}
                className="rounded-3xl border border-slate-200 bg-slate-50/90 p-3 shadow-sm ring-1 ring-slate-200/70 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/40 dark:ring-slate-600/40"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("taskId");
                  if (id) patchTask(id, { status: col.key });
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{col.label}</h4>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold dark:bg-slate-700">
                    {tasks.filter((t) => t.status === col.key).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === col.key)
                    .map((task) => (
                      <motion.div
                        layout
                        key={task._id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}
                        whileHover={{ y: -2, scale: 1.01 }}
                        className="cursor-move rounded-2xl border border-slate-200 bg-white p-3 shadow-md ring-1 ring-slate-200/60 dark:border-slate-600 dark:bg-slate-800/60 dark:ring-slate-600/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityClass[task.priority] || ""}`}>{task.priority}</span>
                        </div>
                        {task.description && <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{task.description}</p>}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-600 dark:bg-slate-700 dark:text-slate-200">{task.status.replace("-", " ")}</span>
                          {task.status !== "completed" && new Date(task.deadline) < new Date() && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">Overdue</span>
                          )}
                        </div>
                        <dl className="mt-2 grid gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <div className="flex justify-between gap-2">
                            <dt className="font-semibold uppercase tracking-wide text-slate-500">Assignee</dt>
                            <dd>{task.assignedTo?.name || "—"}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="font-semibold uppercase tracking-wide text-slate-500">Due</dt>
                            <dd>{fmt(task.deadline)}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="font-semibold uppercase tracking-wide text-slate-500">Created by</dt>
                            <dd>{task.createdBy?.name || "—"}</dd>
                          </div>
                        </dl>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                          <select
                            className="premium-input py-1.5 text-xs"
                            value={task.status}
                            disabled={user?.role !== "admin" && (task.assignedTo?._id || task.assignedTo) !== user?.id}
                            onChange={(e) => patchTask(task._id, { status: e.target.value })}
                          >
                            <option value="todo">To do</option>
                            <option value="in-progress">In progress</option>
                            <option value="completed">Done</option>
                          </select>
                          <select
                            className="premium-input py-1.5 text-xs"
                            value={task.priority}
                            disabled={user?.role !== "admin" && (task.assignedTo?._id || task.assignedTo) !== user?.id}
                            onChange={(e) => patchTask(task._id, { priority: e.target.value })}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                          <select
                            className="premium-input py-1.5 text-xs"
                            value={task.assignedTo?._id || task.assignedTo}
                            disabled={user?.role !== "admin"}
                            onChange={(e) => patchTask(task._id, { assignedTo: e.target.value })}
                          >
                            {users.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(user?.role === "admin" || (task.assignedTo?._id || task.assignedTo) === user?.id) && (
                            <button
                              type="button"
                              className="text-xs font-semibold text-slate-600 underline dark:text-slate-300"
                              onClick={() =>
                                setEditing({
                                  ...task,
                                  assignedTo: task.assignedTo?._id || task.assignedTo,
                                  deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : ""
                                })
                              }
                            >
                              Edit details
                            </button>
                          )}
                          {user?.role === "admin" && (
                            <button type="button" className="text-xs font-semibold text-rose-600 dark:text-rose-400" onClick={() => deleteTask(task._id)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  {tasks.filter((t) => t.status === col.key).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300/80 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">No tasks here.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            role="presentation"
            onClick={() => setEditing(null)}
          >
            <motion.form
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={saveEdit}
              className="premium-card w-full max-w-lg space-y-3 p-6"
            >
              <h3 className="text-lg font-semibold">Edit task</h3>
              <input className="premium-input w-full" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <textarea className="premium-input min-h-[80px] w-full" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              <div className="grid gap-2 sm:grid-cols-2">
                <select className="premium-input" value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value })}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select className="premium-input" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Done</option>
                </select>
                <input className="premium-input" type="date" value={editing.deadline?.slice(0, 10) || ""} onChange={(e) => setEditing({ ...editing, deadline: e.target.value })} />
                <select className="premium-input" value={editing.assignedTo} onChange={(e) => setEditing({ ...editing, assignedTo: e.target.value })}>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="primary-btn flex-1">
                  Save
                </button>
                <button type="button" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700 shadow-sm hover:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectWorkspacePage;
