import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";
import LogoutButton from "@/components/LogoutButton";
import { requireAdminAccess } from "@/lib/auth/admin";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { adminName } = await requireAdminAccess();

  return (
    <div className="min-h-screen bg-brand-light">
      <header className="border-b border-brand-dark/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/LOGO.png"
                alt="IngaPan"
                width={120}
                height={80}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <span className="hidden rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-red sm:inline-block">
              Painel Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-brand-dark/70 md:inline">
              {adminName ? `Admin: ${adminName}` : "Administrador"}
            </span>
            <Link
              href="/dashboard"
              className="rounded-lg border border-brand-dark/20 px-3 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-dark/5"
            >
              Dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
