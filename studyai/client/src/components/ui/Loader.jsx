// src/components/ui/Loader.jsx
import React from "react";
import { motion } from "framer-motion";

const Loader = ({ size = "md", text = "", fullScreen = false }) => {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
      </div>
      {text && <p className="text-sm text-slate-400 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-950 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 relative">
            <div className="absolute inset-0 rounded-full border-2 border-brand-900" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.6s" }} />
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading StudyAI...</p>
        </motion.div>
      </div>
    );
  }

  return spinner;
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader size="lg" text="Loading..." />
  </div>
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`glass-card p-5 space-y-3 ${className}`}>
    <div className="h-4 w-2/3 rounded shimmer" />
    <div className="h-3 w-full rounded shimmer" />
    <div className="h-3 w-4/5 rounded shimmer" />
    <div className="h-8 w-24 rounded-lg shimmer mt-2" />
  </div>
);

export default Loader;
