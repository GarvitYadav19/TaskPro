import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import ProjectWorkspacePage from "./pages/ProjectWorkspacePage";

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
