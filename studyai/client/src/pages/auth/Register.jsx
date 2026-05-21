// src/pages/auth/Register.jsx
import React from "react";
import { motion } from "framer-motion";
import { MdAutoAwesome } from "react-icons/md";
import RegisterForm from "../../components/forms/RegisterForm";

const Register = () => (
  <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
            <MdAutoAwesome size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Study<span className="text-brand-400">AI</span>
          </span>
        </div>
        <h2 className="text-xl font-display font-bold text-white">Create your account</h2>
        <p className="text-sm text-slate-500 mt-1">Start your AI-powered study journey</p>
      </div>

      <div className="glass-card p-6">
        <RegisterForm />
      </div>
    </motion.div>
  </div>
);

export default Register;
