"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AdminSidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextValue | null>(
  null
);

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((current) => !current),
    }),
    [collapsed]
  );

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error(
      "useAdminSidebar deve ser usado dentro de AdminSidebarProvider"
    );
  }
  return context;
}
