"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNavigate = () => {
    setLoading(true);
    router.push("/admin/products");
  };

  return (
    <button
      onClick={handleNavigate}
      disabled={loading}
      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-red/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? "Carregando..." : "Abrir painel admin de produtos"}
    </button>
  );
}
