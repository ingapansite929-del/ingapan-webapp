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
            {isAdmin ? "Painel administrativo" : "Bem-vindo ao seu painel"}
          </h1>
          <p className="text-brand-dark/60 mt-2">
            {isAdmin
              ? "Acesse os módulos de gestão da plataforma."
              : "Gerencie seus pedidos e informações de conta"}
          </p>
        </div>

        {isAdmin ? (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-xl font-bold font-heading text-brand-dark">
              Ferramentas de gestão
            </h2>
            <p className="mb-6 text-sm text-brand-dark/60">
              Selecione um módulo para administrar dados e operações.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/admin/products"
                className="group rounded-xl border border-brand-dark/10 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40"
              >
                <div className="mb-3 inline-flex rounded-lg bg-brand-red/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-red">
                  Módulo ativo
                </div>
                <h3 className="text-lg font-semibold text-brand-dark">
                  Gestão de produtos
                </h3>
                <p className="mt-2 text-sm text-brand-dark/70">
                  Cadastre, edite e organize o catálogo de produtos.
                </p>
                <span className="mt-4 inline-flex text-sm font-medium text-brand-red transition-transform group-hover:translate-x-0.5">
                  Acessar módulo →
                </span>
              </Link>

              <Link
                href="/admin/clientes"
                className="group rounded-xl border border-brand-dark/10 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40"
              >
                <div className="mb-3 inline-flex rounded-lg bg-brand-yellow/30 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange">
                  Em breve
                </div>
                <h3 className="text-lg font-semibold text-brand-dark">
                  Gestão de clientes
                </h3>
                <p className="mt-2 text-sm text-brand-dark/70">
                  Novo módulo separado para administração de clientes.
                </p>
                <span className="mt-4 inline-flex text-sm font-medium text-brand-red transition-transform group-hover:translate-x-0.5">
                  Acessar módulo →
                </span>
              </Link>
            </div>
          </section>
        ) : (
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
                <span className="inline-flex items-center rounded-full bg-brand-yellow/20 px-2.5 py-0.5 text-xs font-medium text-brand-orange">
                  Cliente
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
