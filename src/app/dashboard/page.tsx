import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/admin";
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

  const isAdmin = isAdminRole(cliente?.role);

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

          {isAdmin && (
            <Link
              href="/admin/products"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-red/90 hover:shadow-lg"
            >
              Abrir painel admin de produtos
            </Link>
          )}
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
                isAdmin
                  ? "bg-brand-red/10 text-brand-red"
                  : "bg-brand-yellow/20 text-brand-orange"
              }`}>
                {isAdmin ? "Administrador" : "Cliente"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
