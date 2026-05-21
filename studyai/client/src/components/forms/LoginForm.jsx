// src/components/forms/LoginForm.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) navigate("/dashboard");
      else toast.error(result.message || "Login failed");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
        <div className="relative">
          <MdEmail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
        <div className="relative">
          <MdLock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPass ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full pl-10 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPass ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
          </button>
        </div>
      </div>

      <Button type="submit" loading={loading} fullWidth variant="gradient" size="lg" className="mt-2">
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Create account
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
