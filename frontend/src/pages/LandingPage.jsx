import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen px-5 py-8">
    <div className="mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-8 text-center md:p-14">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-brand-500">Team Task Manager</p>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-lg font-bold text-white shadow-md">
          TP
        </div>
        <h1 className="text-4xl font-bold md:text-6xl">TaskPro Elite</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          Premium workspace for projects, tasks, analytics, and collaborative execution.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/signup" className="primary-btn px-5">
            Get Started
          </Link>
          <Link to="/login" className="rounded-xl border border-white/35 bg-white/70 px-5 py-2 shadow-sm backdrop-blur transition-all duration-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/65">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  </div>
);

export default LandingPage;
