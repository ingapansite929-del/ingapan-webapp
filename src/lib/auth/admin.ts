import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/auth/login";
export const ADMIN_ROLE = "admin_ingapan";

function normalizeRole(role: unknown): string {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

export function isAdminRole(role: unknown): boolean {
  return normalizeRole(role) === ADMIN_ROLE;
}

interface RequireAdminOptions {
  forbiddenRedirectPath?: string;
}

export interface AdminSessionContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  adminName: string | null;
}

export async function requireAdminAccess(
  options: RequireAdminOptions = {}
): Promise<AdminSessionContext> {
  const { forbiddenRedirectPath = "/dashboard" } = options;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(LOGIN_PATH);
  }

  const { data: cliente, error: roleError } = await supabase
    .from("clientes")
    .select("role, nome")
    .eq("id", user.id)
    .maybeSingle();

  if (roleError || !cliente || !isAdminRole(cliente.role)) {
    redirect(forbiddenRedirectPath);
  }

  return {
    supabase,
    userId: user.id,
    adminName: cliente.nome ?? null,
  };
}
