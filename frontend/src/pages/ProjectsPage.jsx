import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getInitials, roleLabel } from "../utils/ui";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", members: [] });
  const { user } = useAuth();

  const load = async () => {
    const [projectRes, userRes] = await Promise.all([api.get("/projects"), api.get("/users")]);
    setProjects(projectRes.data);
    setUsers(userRes.data);
  };
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/projects", form);
    setForm({ title: "", description: "", members: [] });
    load();
  };

  const toggleMember = (memberId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(memberId) ? prev.members.filter((id) => id !== memberId) : [...prev.members, memberId]
    }));
  };

  const removeProject = async (projectId) => {
    const ok = window.confirm("Are you sure you want to delete this project?");
    if (!ok) return;
    await api.delete(`/projects/${projectId}`);
    load();
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="premium-card p-4">
          <p className="text-xs text-slate-500">Total Active</p>
          <p className="mt-1 text-3xl font-semibold text-[#1d4ed8]">{projects.length}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-slate-500">In Progress</p>
          <p className="mt-1 text-3xl font-semibold">{projects.length}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-xs text-slate-500">Workspace Members</p>
          <p className="mt-1 text-3xl font-semibold">{users.length}</p>
        </div>
      </section>

      {user?.role === "admin" && (
        <form className="premium-card p-4" onSubmit={create}>
          <h2 className="mb-3 text-xl font-semibold">Create Project</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="premium-input" placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="premium-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="rounded-2xl border border-white/25 bg-white/50 p-3 backdrop-blur dark:border-slate-700/50 dark:bg-slate-900/35 md:col-span-2">
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Select team members</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((u) => (
                  <label key={u._id} className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/60 px-2 py-1.5 text-sm backdrop-blur dark:border-slate-600 dark:bg-slate-900/55">
                    <input type="checkbox" className="h-4 w-4 accent-[#1d4ed8]" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} />
                    <span className="truncate">{u.name}</span>
                    <span className="ml-auto text-xs text-slate-500">{roleLabel(u.role)}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="primary-btn w-fit text-sm">Create Project</button>
          </div>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <div key={p._id} className="premium-card p-4">
            <span className="rounded-md bg-indigo-100 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">Project</span>
            <h3 className="mt-3 text-2xl font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{p.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex -space-x-2">
                {(p.members || []).slice(0, 3).map((member) => (
                  <span key={member._id} title={`${member.name} (${roleLabel(member.role)})`} className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-slate-200 text-xs font-semibold text-slate-700 dark:border-slate-900 dark:bg-slate-700 dark:text-slate-100">
                    {getInitials(member.name)}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500" title={(p.members || []).map((member) => member.name).join(", ")}>
                {p.members?.length || 0} members
              </p>
            </div>
            {user?.role === "admin" && (
              <button onClick={() => removeProject(p._id)} className="mt-4 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/20">
                Delete Project
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
