"use client";

import React, { createContext, useContext, useState } from "react";

type SidebarType = "main" | "secondary";

interface SidebarToggleContextType {
  activeSidebar: SidebarType;
  setActiveSidebar: (sidebar: SidebarType) => void;
  toggleSidebar: () => void;
}

const SidebarToggleContext = createContext<SidebarToggleContextType | undefined>(undefined);

export function SidebarToggleProvider({ children }: { children: React.ReactNode }) {
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>("main");

  const toggleSidebar = () => {
    setActiveSidebar(prev => prev === "main" ? "secondary" : "main");
  };

  return (
    <SidebarToggleContext.Provider value={{ activeSidebar, setActiveSidebar, toggleSidebar }}>
      {children}
    </SidebarToggleContext.Provider>
  );
}

export function useSidebarToggle() {
  const context = useContext(SidebarToggleContext);
  if (!context) {
    throw new Error("useSidebarToggle must be used within SidebarToggleProvider");
  }
  return context;
}