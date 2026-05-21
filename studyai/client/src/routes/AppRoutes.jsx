// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Dashboard pages
import Dashboard from "../pages/dashboard/Dashboard";
import Tasks from "../pages/dashboard/Tasks";
import Notes from "../pages/dashboard/Notes";
import AIChat from "../pages/dashboard/AIChat";
import Summaries from "../pages/dashboard/Summaries";
import Pomodoro from "../pages/dashboard/Pomodoro";
import Analytics from "../pages/dashboard/Analytics";

// Layout
import DashboardLayout from "../components/ui/DashboardLayout";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Public route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

    {/* Protected dashboard routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="notes" element={<Notes />} />
      <Route path="chat" element={<AIChat />} />
      <Route path="summaries" element={<Summaries />} />
      <Route path="pomodoro" element={<Pomodoro />} />
      <Route path="analytics" element={<Analytics />} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
