"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string | number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 5000) => {
      toast[type](message, { duration });
    },
    []
  );

  const removeToast = useCallback((id: string | number) => {
    toast.dismiss(id);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </ToastContext.Provider>
  );
}
