// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MdTask, MdNote, MdTimer, MdAutoAwesome,
  MdArrowForward, MdTrendingUp, MdCheckCircle,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { analyticsService } from "../../services/analyticsService";
import { taskService } from "../../services/taskService";
import { StudyHoursChart } from "../../components/dashboard/ProductivityChart";
import TaskCard from "../../components/dashboard/TaskCard";
import { PageLoader } from "../../components/ui/Loader";
import { formatMinutes } from "../../utils/formatDate";
import toast from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-4 hover:border-white/15 transition-colors"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-2xl font-display font-bold text-white">{value}</p>
    <p className="text-xs font-medium text-slate-400 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, tasksRes] = await Promise.all([
          analyticsService.getDashboard(),
          taskService.getTasks({ status: "todo", limit: 5, sort: "-priority" }),
        ]);
        setAnalytics(analyticsRes.data?.analytics);
        setTasks(tasksRes.data?.tasks || []);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleTask = async (task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    try {
      await taskService.updateTask(task._id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
    } catch {
      toast.error("Failed to update task");
    }
  };

  if (loading) return <PageLoader />;

  const ov = analytics?.overview || {};

  const stats = [
    { icon: MdTask, label: "Tasks Completed", value: ov.completedTasks || 0, sub: `${ov.completionRate || 0}% completion rate`, color: "bg-emerald-500/15 text-emerald-400", delay: 0.05 },
    { icon: MdTimer, label: "Weekly Study", value: `${ov.weeklyStudyHours || 0}h`, sub: `${ov.weeklySessions || 0} sessions`, color: "bg-brand-500/15 text-brand-400", delay: 0.1 },
    { icon: MdNote, label: "Notes Uploaded", value: ov.totalNotes || 0, sub: `${ov.totalSummaries || 0} summaries`, color: "bg-purple-500/15 text-purple-400", delay: 0.15 },
    { icon: MdTrendingUp, label: "Focus Score", value: `${ov.avgFocusScore || 0}%`, sub: "This week", color: "bg-amber-500/15 text-amber-400", delay: 0.2 },
  ];

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 bg-gradient-to-br from-brand-600/20 to-purple-600/10 border-brand-500/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white">
              Welcome back, {user?.name?.split(" ")[0]}! 🎓
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Ready to make today productive? You have{" "}
              <span className="text-white font-medium">{ov.pendingTasks || 0} tasks</span> pending.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <MdAutoAwesome size={32} className="text-brand-400 opacity-60" />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Study hours chart */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Study Hours (7 days)</h3>
            <Link to="/analytics" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <MdArrowForward size={13} />
            </Link>
          </div>
          <StudyHoursChart data={analytics?.charts?.dailyStudyHours || []} />
        </motion.div>

        {/* Pending tasks */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Upcoming Tasks</h3>
            <Link to="/tasks" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <MdArrowForward size={13} />
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MdCheckCircle size={32} className="text-emerald-500/40 mb-2" />
              <p className="text-sm text-slate-500">No pending tasks!</p>
              <Link to="/tasks" className="text-xs text-brand-400 mt-1">Add a task →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-5"
      >
        <h3 className="font-display font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: "/tasks", icon: "📋", label: "Add Task", color: "hover:bg-emerald-500/10 hover:border-emerald-500/20" },
            { to: "/notes", icon: "📄", label: "Upload PDF", color: "hover:bg-brand-500/10 hover:border-brand-500/20" },
            { to: "/pomodoro", icon: "⏱️", label: "Start Focus", color: "hover:bg-amber-500/10 hover:border-amber-500/20" },
            { to: "/chat", icon: "🤖", label: "Ask AI", color: "hover:bg-purple-500/10 hover:border-purple-500/20" },
          ].map(({ to, icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-white/8 text-center transition-all ${color}`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-slate-400">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
