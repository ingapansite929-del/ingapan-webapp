"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/CartContext";
import CartSidebar from "@/components/CartSidebar";
import { ToastProvider } from "@/components/Toast";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <ToastProvider>
          <AdminSidebarProvider>
            <CartProvider>
              {children}
              <CartSidebar />
            </CartProvider>
          </AdminSidebarProvider>
        </ToastProvider>
      </TooltipProvider>
    </MotionConfig>
  );
}
