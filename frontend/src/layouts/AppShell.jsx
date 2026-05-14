import { Moon, Sun, Menu, LogOut, LayoutDashboard, FolderKanban, ListChecks, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getInitials, roleLabel } from "../utils/ui";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: ListChecks }
];

const AppShell = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const location = useLocation();

  return (
    <div className="h-screen">
      {open && <button className="fixed inset-0 z-20 bg-slate-900/30 md:hidden" onClick={() => setOpen(false)} aria-label="Close sidebar backdrop" />}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[320px] flex-col border-r border-slate-200/90 bg-gradient-to-b from-white to-slate-100 p-5 shadow-xl transition-transform dark:border-slate-700/40 dark:from-slate-900/95 dark:to-slate-900/90 dark:shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-200/80 dark:border-slate-600 dark:bg-slate-800 dark:ring-slate-600/50">
              <img src="/logo.png" alt="TaskPro" className="h-full w-full object-cover" width={44} height={44} />
            </div>
            <div>
              <h1 className="text-[28px] font-bold leading-tight text-slate-900 dark:text-slate-100">TaskPro Elite</h1>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Team Command Center</p>
            </div>
          </div>
          <button className="rounded-lg p-2 hover:bg-slate-200 md:hidden dark:hover:bg-slate-800" onClick={() => setOpen(false)} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>
        <span className="mb-5 w-fit rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          {roleLabel(user?.role)}
        </span>
        <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => {
                  const projectsActive = link.to === "/projects" && location.pathname.startsWith("/projects");
                  const active = isActive || projectsActive;
                  return `flex items-center gap-3 rounded-2xl px-4 py-3 text-lg font-medium transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100/90 dark:text-slate-300 dark:hover:bg-slate-800/70"
                  }`;
                }}
                onClick={() => setOpen(false)}
              >
                <Icon size={20} />
                {link.label}
              </NavLink>
              );
            })}
        </nav>
        <div className="mt-auto rounded-3xl border border-slate-200 bg-white p-3 shadow-md ring-1 ring-slate-200/80 dark:border-slate-700/40 dark:bg-slate-800/60 dark:ring-slate-600/30">
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 px-2.5 py-0.5 text-xs text-white shadow-sm">{roleLabel(user?.role)}</span>
            <div />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 shadow-inner dark:bg-slate-700 dark:text-slate-100">
              {getInitials(user?.name)}
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
          </div>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700 transition-all duration-300 hover:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <main className="h-screen overflow-y-auto px-3 pb-4 pt-3 md:ml-[320px] md:px-5 md:pb-5 md:pt-5">
          <header className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200/90 bg-white px-4 py-3 shadow-md ring-1 ring-slate-200/70 dark:border-slate-700/40 dark:bg-slate-900/55 dark:ring-slate-600/30">
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800" onClick={() => setOpen(!open)}>
                <Menu size={18} />
              </button>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-700" onClick={() => setDarkMode(!darkMode)} title="Dark mode">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>
          <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
