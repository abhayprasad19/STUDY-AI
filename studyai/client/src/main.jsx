// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#1e2433",
                color: "#f1f5f9",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "14px",
                borderRadius: "12px",
                padding: "12px 16px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#1e2433" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#1e2433" },
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
