// src/components/forms/RegisterForm.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import toast from "react-hot-toast";

const RegisterForm = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password);
      if (result.success) navigate("/dashboard");
      else toast.error(result.message || "Registration failed");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:bg-white/8 transition-all";

  const fields = [
    { name: "name", type: "text", placeholder: "Your full name", Icon: MdPerson, label: "Full Name" },
    { name: "email", type: "email", placeholder: "you@example.com", Icon: MdEmail, label: "Email" },
    { name: "password", type: showPass ? "text" : "password", placeholder: "Min. 6 characters", Icon: MdLock, label: "Password", toggle: true },
    { name: "confirm", type: showPass ? "text" : "password", placeholder: "Repeat password", Icon: MdLock, label: "Confirm Password" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ name, type, placeholder, Icon, label, toggle }) => (
        <div key={name} className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
          <div className="relative">
            <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              required
              className={inputClass + (toggle ? " pr-11" : "")}
            />
            {toggle && (
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
              </button>
            )}
          </div>
        </div>
      ))}

      <Button type="submit" loading={loading} fullWidth variant="gradient" size="lg" className="mt-2">
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
