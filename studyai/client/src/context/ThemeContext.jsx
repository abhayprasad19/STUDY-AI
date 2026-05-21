// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((p) => !p);
  const toggleMobileSidebar = () => setMobileSidebarOpen((p) => !p);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <ThemeContext.Provider
      value={{
        sidebarOpen,
        mobileSidebarOpen,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeContext;
