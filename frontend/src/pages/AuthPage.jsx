import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = [
  { id: "admin", label: "Admin Demo", email: "admin@example.com", password: "Password123" },
  { id: "member", label: "Member Demo", email: "member@example.com", password: "Password123" }
];

const AuthPage = ({ mode }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoadingId, setDemoLoadingId] = useState(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (mode === "login") await login({ email: form.email, password: form.password });
      else await signup(form);
      navigate("/dashboard");
    } catch (err) {
      const apiError = err.response?.data;
      if (Array.isArray(apiError?.errors) && apiError.errors.length > 0) {
        setError(apiError.errors[0].msg || "Validation failed");
        return;
      }
      setError(apiError?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demo) => {
    try {
      setDemoLoadingId(demo.id);
      setLoading(true);
      setError("");
      setForm((prev) => ({ ...prev, email: demo.email, password: demo.password }));
      await login({ email: demo.email, password: demo.password });
      navigate("/dashboard");
    } catch (err) {
      const apiError = err.response?.data;
      setError(apiError?.message || "Demo login failed");
    } finally {
      setDemoLoadingId(null);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/25 bg-white/45 shadow-2xl backdrop-blur-2xl dark:border-slate-700/40 dark:bg-slate-900/45 md:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-[#113dd8]/95 via-blue-600/95 to-[#0d2bb6]/95 p-8 text-white md:block">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-base font-bold shadow-lg">TP</div>
          <h2 className="text-4xl font-bold">TaskPro Elite</h2>
          <p className="mt-5 text-2xl font-semibold">Elevate your team’s creative flow.</p>
          <p className="mt-3 max-w-sm text-indigo-100">Join next-generation workspaces with structured execution and premium analytics.</p>
        </div>
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500/80">Welcome Back</p>
        <h1 className="text-4xl font-semibold leading-tight">{mode === "login" ? "Log in" : "Create Account"}</h1>
        <p className="text-base text-slate-600 dark:text-slate-300">
          {mode === "login" ? "Pick up where your team left off." : "Create your workspace account to get started."}
        </p>
        {mode !== "login" && (
          <>
            <input className="premium-input w-full" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm({ ...form, role: "member" })} className={`rounded-xl border px-3 py-2 ${form.role === "member" ? "border-[#1d4ed8] bg-blue-50 text-[#1d4ed8] dark:bg-blue-950/30" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}>Member</button>
              <button type="button" onClick={() => setForm({ ...form, role: "admin" })} className={`rounded-xl border px-3 py-2 ${form.role === "admin" ? "border-[#1d4ed8] bg-blue-50 text-[#1d4ed8] dark:bg-blue-950/30" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}>Admin</button>
            </div>
          </>
        )}
        <input className="premium-input w-full" placeholder="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="premium-input w-full" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button disabled={loading} className="primary-btn w-full">
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create Account"}
        </button>
        {mode === "login" && (
          <div className="rounded-3xl border border-white/30 bg-white/55 p-4 shadow-lg backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/40">
            <h3 className="text-xl font-semibold">Demo Accounts</h3>
            <p className="mb-3 mt-1 text-sm text-slate-500 dark:text-slate-300">Click any demo account below to log in instantly.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((demo) => (
                <motion.button
                  key={demo.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  onClick={() => handleDemoLogin(demo)}
                  className="rounded-2xl border border-white/35 bg-white/75 p-3 text-left shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <p className="font-semibold">{demo.label}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{demo.email}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Password: {demo.password}</p>
                  {demoLoadingId === demo.id && <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">Signing in...</p>}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        <p className="text-sm text-slate-500">
          {mode === "login" ? "New here?" : "Already have account?"}{" "}
          <Link to={mode === "login" ? "/signup" : "/login"} state={{ from: location.pathname }} className="text-brand-500">
            {mode === "login" ? "Create account" : "Login"}
          </Link>
        </p>
      </motion.form>
      </div>
    </div>
  );
};

export default AuthPage;
