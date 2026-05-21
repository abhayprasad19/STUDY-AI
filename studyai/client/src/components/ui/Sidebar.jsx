// src/components/ui/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDashboard, MdTask, MdNote, MdChat, MdSummarize,
  MdTimer, MdBarChart, MdLogout, MdClose, MdAutoAwesome,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getInitials } from "../../utils/helperFunctions";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: MdDashboard, label: "Dashboard" },
  { to: "/tasks", icon: MdTask, label: "Tasks" },
  { to: "/notes", icon: MdNote, label: "Notes & PDFs" },
  { to: "/summaries", icon: MdSummarize, label: "AI Summaries" },
  { to: "/chat", icon: MdChat, label: "AI Chat" },
  { to: "/pomodoro", icon: MdTimer, label: "Pomodoro" },
  { to: "/analytics", icon: MdBarChart, label: "Analytics" },
];

const SidebarContent = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-900/40">
            <MdAutoAwesome size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            Study<span className="text-brand-400">AI</span>
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 lg:hidden">
            <MdClose size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-brand-600/20 text-brand-400 border border-brand-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} className={isActive ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300"} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
          >
            <MdLogout size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { sidebarOpen, mobileSidebarOpen, closeMobileSidebar } = useTheme();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-surface-900 border-r border-white/8 z-30 sidebar-transition ${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-surface-900 border-r border-white/8 z-50 flex flex-col lg:hidden"
            >
              <SidebarContent onClose={closeMobileSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
