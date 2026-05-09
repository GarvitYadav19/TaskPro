import { motion } from "framer-motion";

const columns = [
  { key: "todo", label: "Todo" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" }
];

const priorityStyles = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
};

const KanbanBoard = ({ tasks, onMove }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => (
        <div
          key={col.key}
          className="premium-card p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const taskId = e.dataTransfer.getData("taskId");
            if (taskId) onMove(taskId, col.key);
          }}
        >
          <h4 className="mb-3 font-semibold">{col.label}</h4>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status === col.key)
              .map((task) => (
                <motion.div
                  key={task._id}
                  layout
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}
                  className="cursor-move rounded-2xl border border-white/30 bg-white/70 p-3 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-700/45 dark:bg-slate-900/65"
                >
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{task.projectId?.title || "No project"}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={`rounded-full px-2 py-0.5 capitalize ${priorityStyles[task.priority] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{task.priority}</span>
                    <span className="text-slate-500">{new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">{tasks.filter((t) => t.status === col.key).length} items</p>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
