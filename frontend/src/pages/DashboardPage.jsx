import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle2, ListTodo, AlertTriangle, Clock3 } from "lucide-react";
import api from "../services/api";
import AnalyticsCharts from "../components/charts/AnalyticsCharts";

const icons = [ListTodo, CheckCircle2, Clock3, AlertTriangle];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard-stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="glass p-5">Loading analytics...</div>;

  const cards = [
    { label: "Total Tasks", value: stats.kpis.total },
    { label: "Completed", value: stats.kpis.completed },
    { label: "Pending", value: stats.kpis.todo + stats.kpis.inProgress },
    { label: "Overdue", value: stats.kpis.overdue }
  ];

  return (
    <div className="space-y-5">
<section className="rounded-xl bg-gradient-to-r from-[#1d4ed8] via-blue-600 to-indigo-700 p-6 text-white shadow-lg">
  <p className="text-xs uppercase tracking-[0.18em] text-blue-100">
    Workspace Overview
  </p>

  <h2 className="mt-2 text-3xl font-semibold">
    Collaborate. Track. Deliver.
  </h2>

  <p className="mt-1 text-sm text-blue-100">
    Stay aligned with your team, manage tasks efficiently, and keep projects moving forward.
  </p>
</section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = icons[i];
          return (
            <motion.div whileHover={{ y: -2, scale: 1.01 }} key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-300">{card.label}</p>
                <Icon size={18} />
              </div>
              <p className="text-3xl font-semibold">{card.value}</p>
            </motion.div>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsCharts stats={stats} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 font-semibold">Recent Activity</h3>
        <div className="space-y-2">
          {stats.recentActivity.map((a) => (
            <div key={a.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p>{a.title}</p>
              <p className="text-xs capitalize text-slate-500">{a.status.replace("-", " ")} updated</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
