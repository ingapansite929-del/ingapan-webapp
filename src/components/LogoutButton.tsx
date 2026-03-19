"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-brand-dark/10 px-4 py-2 text-sm font-medium text-brand-dark transition-all hover:bg-brand-dark/20 cursor-pointer"
    >
      Sair
    </button>
  );
}
