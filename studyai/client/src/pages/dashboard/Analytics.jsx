// src/pages/dashboard/Analytics.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdAutoAwesome, MdTrendingUp, MdTimer, MdTask, MdLightbulb } from "react-icons/md";
import { analyticsService } from "../../services/analyticsService";
import {
  StudyHoursChart, TaskCompletionChart, FocusScoreChart,
} from "../../components/dashboard/ProductivityChart";
import Button from "../../components/ui/Button";
import { PageLoader } from "../../components/ui/Loader";
import { RECOMMENDATION_COLORS } from "../../utils/constants";
import { clsx } from "../../utils/helperFunctions";
import toast from "react-hot-toast";

const StatBadge = ({ value, label, icon, color }) => (
  <div className="glass-card p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xl font-display font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, sessionsRes] = await Promise.all([
          analyticsService.getDashboard(),
          analyticsService.getSessions({ limit: 10 }),
        ]);
        setAnalytics(analyticsRes.data?.analytics);
        setSessions(sessionsRes.data?.sessions || []);
      } catch { toast.error("Failed to load analytics"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    try {
      const { data } = await analyticsService.getInsights();
      setInsights(data?.insights);
    } catch { toast.error("Failed to get insights"); }
    finally { setLoadingInsights(false); }
  };

  if (loading) return <PageLoader />;
  const ov = analytics?.overview || {};

  return (
    <div className="p-5 lg:p-7 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Your productivity overview</p>
        </div>
        <Button
          onClick={handleGetInsights}
          loading={loadingInsights}
          variant="gradient"
          icon={<MdAutoAwesome size={16} />}
        >
          Get AI Insights
        </Button>
      </div>

      {/* Stat badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge value={ov.completionRate + "%" || "0%"} label="Task Completion" icon={<MdTask size={18} />} color="bg-emerald-500/15 text-emerald-400" />
        <StatBadge value={ov.weeklyStudyHours + "h" || "0h"} label="Weekly Study" icon={<MdTimer size={18} />} color="bg-brand-500/15 text-brand-400" />
        <StatBadge value={ov.weeklySessions || 0} label="Focus Sessions" icon={<MdTrendingUp size={18} />} color="bg-purple-500/15 text-purple-400" />
        <StatBadge value={ov.avgFocusScore + "%" || "0%"} label="Avg Focus Score" icon={<MdLightbulb size={18} />} color="bg-amber-500/15 text-amber-400" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold text-white mb-4">Daily Study Hours</h3>
          <StudyHoursChart data={analytics?.charts?.dailyStudyHours || []} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold text-white mb-4">Weekly Task Completion</h3>
          <TaskCompletionChart data={analytics?.charts?.weekTaskCompletion || {}} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold text-white mb-4">Focus Score Trend</h3>
          <FocusScoreChart sessions={sessions} />
        </motion.div>

        {/* Recent sessions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold text-white mb-4">Recent Sessions</h3>
          <div className="space-y-2 overflow-y-auto max-h-48">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No sessions recorded yet</p>
            ) : (
              sessions.map((s) => (
                <div key={s._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 border border-white/6">
                  <span className="text-base">{s.type === "focus" ? "🎯" : "☕"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 capitalize">{s.type}</p>
                    <p className="text-xs text-slate-500">{Math.round((s.completedDuration || 0) / 60)} min</p>
                  </div>
                  {s.focusScore && (
                    <span className="text-xs text-brand-400 font-mono">{s.focusScore}%</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${s.isCompleted ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 bg-white/5"}`}>
                    {s.isCompleted ? "Done" : "Partial"}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 border-brand-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <MdAutoAwesome size={18} className="text-brand-400" />
            <h3 className="font-display font-semibold text-white">AI Insights</h3>
            <span className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-medium ml-auto",
              insights.trend === "improving" ? "text-emerald-400 bg-emerald-500/10" :
              insights.trend === "declining" ? "text-red-400 bg-red-500/10" :
              "text-yellow-400 bg-yellow-500/10"
            )}>
              {insights.trend}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Insights</p>
              {insights.insights?.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-brand-400 mt-0.5 flex-shrink-0">→</span>
                  {insight}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggestions</p>
              {insights.suggestions?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">💡</span>
                  {s}
                </div>
              ))}
              {insights.encouragement && (
                <div className="mt-3 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <p className="text-sm text-brand-300 italic">"{insights.encouragement}"</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
