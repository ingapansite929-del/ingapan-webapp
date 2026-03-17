import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
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

            <div className="flex items-center gap-4">
              <span className="text-sm text-brand-dark/60">
                Olá, <span className="font-semibold text-brand-dark">{cliente?.nome || user.email}</span>
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark font-heading">
            Bem-vindo ao seu painel
          </h1>
          <p className="text-brand-dark/60 mt-2">
            Gerencie seus pedidos e informações de conta
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-red/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-brand-dark/60">Pedidos</p>
                <p className="text-2xl font-bold text-brand-dark">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-yellow/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-brand-dark/60">Pendentes</p>
                <p className="text-2xl font-bold text-brand-dark">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-brand-dark/60">Entregues</p>
                <p className="text-2xl font-bold text-brand-dark">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-brand-dark font-heading mb-4">
            Informações da conta
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-brand-dark/60">Nome da Empresa</p>
              <p className="text-brand-dark font-medium">{cliente?.nome || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-brand-dark/60">Email</p>
              <p className="text-brand-dark font-medium">{cliente?.email || user.email}</p>
            </div>
            <div>
              <p className="text-sm text-brand-dark/60">CNPJ</p>
              <p className="text-brand-dark font-medium">
                {cliente?.cnpj
                  ? cliente.cnpj.replace(
                      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                      "$1.$2.$3/$4-$5"
                    )
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-dark/60">Tipo de conta</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                cliente?.role === "admin_ingapan"
                  ? "bg-brand-red/10 text-brand-red"
                  : "bg-brand-yellow/20 text-brand-orange"
              }`}>
                {cliente?.role === "admin_ingapan" ? "Administrador" : "Cliente"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
