import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen px-5 py-8">
    <div className="mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-8 text-center md:p-14">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-brand-500">Team Task Manager</p>
        <div className="mx-auto mb-4 h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-200/80 dark:border-slate-600 dark:bg-slate-800 dark:ring-slate-600/50">
          <img src="/logo.png" alt="TaskPro Elite" className="h-full w-full object-cover" width={56} height={56} />
        </div>
        <h1 className="text-4xl font-bold md:text-6xl">TaskPro Elite</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          Premium workspace for projects, tasks, analytics, and collaborative execution.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/login" className="primary-btn px-5">
            Get Started
          </Link>
          <Link to="/signup" className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-200 dark:hover:bg-slate-800">
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  </div>
);

export default LandingPage;
