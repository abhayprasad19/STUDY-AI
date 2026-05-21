// src/components/ui/Navbar.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { MdMenu, MdNotifications, MdSearch } from "react-icons/md";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/tasks": "Task Manager",
  "/notes": "Notes & PDFs",
  "/summaries": "AI Summaries",
  "/chat": "AI Chat",
  "/pomodoro": "Pomodoro Timer",
  "/analytics": "Analytics",
};

const Navbar = () => {
  const { toggleSidebar, toggleMobileSidebar, sidebarOpen } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || "StudyAI";
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="h-16 flex items-center px-4 lg:px-6 border-b border-white/8 bg-surface-900/80 backdrop-blur-md sticky top-0 z-20">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => {
            toggleSidebar();
            toggleMobileSidebar();
          }}
          className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors lg:hidden"
        >
          <MdMenu size={22} />
        </button>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors hidden lg:flex"
        >
          <MdMenu size={22} />
        </button>

        <div>
          <h1 className="text-base font-semibold text-white font-display">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors hidden md:flex">
          <MdSearch size={20} />
        </button>
        <button className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors relative">
          <MdNotifications size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white ml-1">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
