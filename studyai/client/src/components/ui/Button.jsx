// src/components/ui/Button.jsx
import React from "react";
import { motion } from "framer-motion";
import { clsx } from "../../utils/helperFunctions";

const variants = {
  primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/30",
  secondary: "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20",
  danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
  success: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
  ghost: "hover:bg-white/5 text-slate-400 hover:text-slate-200",
  gradient: "bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg shadow-brand-900/40",
};

const sizes = {
  xs: "px-2.5 py-1.5 text-xs rounded-lg",
  sm: "px-3.5 py-2 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = "",
  onClick,
  type = "button",
  fullWidth = false,
  ...props
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </motion.button>
  );
};

export default Button;
