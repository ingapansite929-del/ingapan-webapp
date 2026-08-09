import type { ReactNode } from "react";
import AdminQueryProvider from "@/components/admin/AdminQueryProvider";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { adminName } = await requireAdminAccess();
  return (
    <AdminQueryProvider>
      <AdminShell adminName={adminName}>{children}</AdminShell>
    </AdminQueryProvider>
  );
}
