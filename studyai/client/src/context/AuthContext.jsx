// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("studyai_token"));
  const [loading, setLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (tkn) => {
    try {
      const decoded = jwtDecode(tkn);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Load user from token on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token && !isTokenExpired(token)) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const { data } = await api.get("/auth/profile");
          if (data.success) setUser(data.user);
        } catch {
          logout();
        }
      } else if (token) {
        logout();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.success) {
      localStorage.setItem("studyai_token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}! 👋`);
      return { success: true };
    }
    return { success: false, message: data.message };
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    if (data.success) {
      localStorage.setItem("studyai_token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome to StudyAI, ${data.user.name.split(" ")[0]}! 🎉`);
      return { success: true };
    }
    return { success: false, message: data.message };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("studyai_token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
