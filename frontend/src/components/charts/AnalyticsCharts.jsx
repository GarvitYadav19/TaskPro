import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#6366f1", "#38bdf8", "#22c55e", "#f43f5e"];
const tooltipStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.25)",
  background: "rgba(15,23,42,0.85)",
  color: "#e2e8f0",
  backdropFilter: "blur(8px)"
};

const AnalyticsCharts = ({ stats }) => (
  <>
    <div className="glass p-4 ring-1 ring-slate-200/90 dark:ring-slate-700/45">
      <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Weekly Productivity</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={stats.weeklyProductivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.28)" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="completedTasks" fill="url(#weeklyGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="glass p-4 ring-1 ring-slate-200/90 dark:ring-slate-700/45">
      <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Status Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={stats.statusDistribution} dataKey="value" innerRadius={50} outerRadius={90}>
              {stats.statusDistribution.map((_, i) => (
                <Cell key={COLORS[i]} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
        {stats.statusDistribution.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="capitalize">{entry.name}</span>
            <span>({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default AnalyticsCharts;
