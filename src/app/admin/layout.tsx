import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminAccess } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { adminName } = await requireAdminAccess();
  return <AdminShell adminName={adminName}>{children}</AdminShell>;
}
