import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ListTodo, AlertTriangle, Clock3 } from "lucide-react";
import api from "../services/api";
import AnalyticsCharts from "../components/charts/AnalyticsCharts";

const icons = [ListTodo, CheckCircle2, Clock3, AlertTriangle];

const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

const fmtShort = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard-stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) {
    return (
      <div className="premium-card p-8 text-center text-slate-600 dark:text-slate-300">
        Loading analytics…
      </div>
    );
  }

  const cards = [
    { label: "Total Tasks", value: stats.kpis.total },
    { label: "Completed", value: stats.kpis.completed },
    { label: "Pending", value: stats.kpis.todo + stats.kpis.inProgress },
    { label: "Overdue", value: stats.kpis.overdue }
  ];

  const wl = stats.workload || { todo: 0, inProgress: 0, completed: 0, total: 0 };
  const wTotal = wl.total || 1;
  const priorityLane = stats.priorityLane || [];
  const overdueList = stats.overdueList || [];
  const upcoming = stats.upcomingDueDates || [];
  const recentProjects = stats.recentProjects || [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-6 text-white shadow-2xl ring-1 ring-slate-900/30">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-500/25 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/95">Workspace overview</p>
        <h2 className="relative mt-2 text-3xl font-semibold tracking-tight text-white">Collaborate. Track. Deliver.</h2>
        <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/95">
          Stay aligned with your team, manage tasks efficiently, and keep projects moving forward.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = icons[i];
          return (
            <motion.div whileHover={{ y: -3, scale: 1.015 }} key={card.label} className="premium-card p-4 ring-1 ring-slate-200/90 dark:ring-slate-700/50">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-300">{card.label}</p>
                <Icon size={18} className="text-teal-600 dark:text-teal-300" />
              </div>
              <p className="text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div whileHover={{ y: -2 }} className="premium-card p-5 ring-1 ring-slate-200/90 dark:ring-slate-700/45">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My workload</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{wl.total} total</span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">How your current task queue is distributed.</p>
          <div className="mt-5 space-y-4">
            {[
              { key: "todo", label: "To do", n: wl.todo },
              { key: "inProgress", label: "In progress", n: wl.inProgress },
              { key: "completed", label: "Done", n: wl.completed }
            ].map((row) => {
              const p = pct(row.n, wTotal);
              const badgeClass =
                row.key === "todo"
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                  : row.key === "inProgress"
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : "bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-200";
              return (
                <div key={row.key}>
                  <div className="mb-1 flex justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span>{row.label}</span>
                    <span>{row.n}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all" style={{ width: `${p}%` }} />
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badgeClass}`}>{p}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="premium-card p-5 ring-1 ring-slate-200/90 dark:ring-slate-700/45">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Priority lane</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">The most important work requiring attention today.</p>
          <div className="mt-4 space-y-3">
            {priorityLane.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300/80 py-6 text-center text-sm text-slate-500 dark:border-slate-600">No high-priority items in queue.</p>}
            {priorityLane.map((t) => (
              <Link key={t.id} to={t.projectId ? `/projects/${t.projectId}` : "/tasks"} className="block rounded-2xl border border-slate-200 bg-slate-50/90 p-3 shadow-sm ring-1 ring-slate-200/60 transition hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-600 dark:bg-slate-900/50 dark:ring-slate-600/40 dark:hover:bg-slate-800/80">
                <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.projectTitle}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span>
                    Priority: {String(t.priority).toUpperCase()}
                    {t.overdueDays > 0 ? ` | ${t.overdueDays} day${t.overdueDays > 1 ? "s" : ""} overdue` : ""}
                  </span>
                  {t.overdueDays > 0 && <span className="rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">Overdue</span>}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="premium-card p-5 ring-1 ring-slate-200/90 dark:ring-slate-700/45">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Overdue tasks</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Anything here needs intervention or a due-date reset.</p>
          <div className="mt-4 space-y-3">
            {overdueList.length === 0 && <p className="text-sm text-slate-500">You are all caught up.</p>}
            {overdueList.map((t) => (
              <Link key={t.id} to={t.projectId ? `/projects/${t.projectId}` : "/tasks"} className="block rounded-2xl border border-rose-200 bg-rose-50 p-3 shadow-sm ring-1 ring-rose-200/50 transition hover:bg-rose-50/95 dark:border-rose-900/40 dark:bg-rose-950/20 dark:ring-rose-900/30">
                <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
                <p className="text-xs text-rose-800/80 dark:text-rose-200/80">{t.projectTitle}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>{fmtShort(t.deadline)}</span>
                  <span className="rounded-full border border-rose-300 bg-white px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:border-rose-700 dark:bg-slate-900">Overdue</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="premium-card p-5 ring-1 ring-slate-200/90 dark:ring-slate-700/45">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming due dates</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">The next few tasks approaching a deadline.</p>
          <div className="mt-4">
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-10 text-center ring-1 ring-slate-200/70 dark:border-slate-600 dark:bg-slate-900/30 dark:ring-slate-700/50">
                <p className="font-semibold text-slate-800 dark:text-slate-100">No upcoming deadlines</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">You do not have any near-term due dates assigned at the moment.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((t) => (
                  <Link key={t.id} to={t.projectId ? `/projects/${t.projectId}` : "/tasks"} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-sm ring-1 ring-slate-200/50 transition hover:bg-white dark:border-slate-600 dark:bg-slate-900/40 dark:ring-slate-600/40">
                    <span className="font-medium text-slate-900 dark:text-white">{t.title}</span>
                    <span className="text-xs text-slate-500">{fmtShort(t.deadline)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsCharts stats={stats} />
      </div>

      <div className="premium-card p-5 ring-1 ring-slate-200/90 dark:ring-slate-700/45">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent projects</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">The workspaces with the latest movement and delivery activity.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recentProjects.length === 0 && <p className="text-sm text-slate-500">No projects yet.</p>}
          {recentProjects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-md ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-600 dark:bg-slate-900/50 dark:ring-slate-600/40 dark:hover:bg-slate-800/80">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-slate-900 dark:text-white">{p.title}</h4>
                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">{p.roleBadge}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{p.description || "—"}</p>
              <div className="mt-3 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Completion</span>
                <span>{p.completion}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600" style={{ width: `${p.completion}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-200 bg-slate-50 py-2 shadow-sm dark:border-slate-600 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Tasks</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{p.tasksTotal}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 py-2 shadow-sm dark:border-slate-600 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Members</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{p.members}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 py-2 shadow-sm dark:border-slate-600 dark:bg-slate-800/50">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Overdue</p>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-300">{p.overdue}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Next due: {p.nextDue ? fmtShort(p.nextDue) : "Nothing scheduled"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
