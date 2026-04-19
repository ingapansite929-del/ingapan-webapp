import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/admin";
import LogoutButton from "@/components/LogoutButton";
import { getOrdersByUserId } from "@/features/orders/data";
import type { OrderSummary } from "@/features/orders/types";

const ptBrDateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

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
  let userOrders: OrderSummary[] = [];
  let userOrdersError: string | null = null;

  if (!isAdmin) {
    try {
      userOrders = await getOrdersByUserId(user.id, 10);
    } catch {
      userOrdersError = "Não foi possível carregar seus pedidos no momento.";
    }
  }

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
                <div className="mb-3 inline-flex rounded-lg bg-brand-red/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-red">
                  Módulo ativo
                </div>
                <h3 className="text-lg font-semibold text-brand-dark">
                  Gestão de clientes
                </h3>
                <p className="mt-2 text-sm text-brand-dark/70">
                  Acompanhe pedidos recebidos via WhatsApp e dados dos clientes.
                </p>
                <span className="mt-4 inline-flex text-sm font-medium text-brand-red transition-transform group-hover:translate-x-0.5">
                  Acessar módulo →
                </span>
              </Link>
            </div>
          </section>
        ) : (
          <div className="space-y-6">
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

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-brand-dark font-heading mb-1">
                Meus pedidos
              </h2>
              <p className="mb-5 text-sm text-brand-dark/60">
                Últimos 10 pedidos solicitados via WhatsApp.
              </p>

              {userOrdersError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {userOrdersError}
                </div>
              ) : userOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-dark/20 bg-brand-light/40 px-4 py-10 text-center text-sm text-brand-dark/70">
                  Você ainda não possui pedidos registrados.
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-2xl border border-brand-dark/10 bg-white p-5"
                    >
                      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-dark/10 pb-4">
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">
                            Pedido #{order.id}
                          </p>
                          <p className="text-xs text-brand-dark/60">
                            {ptBrDateTime.format(new Date(order.createdAt))}
                          </p>
                        </div>
                        <span className="rounded-full bg-brand-yellow/20 px-2.5 py-1 text-xs font-medium text-brand-orange">
                          {order.items.reduce((total, item) => total + item.quantity, 0)} itens
                        </span>
                      </header>

                      <ul className="mt-4 space-y-2 rounded-xl bg-brand-light/40 p-3">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 text-sm text-brand-dark"
                          >
                            <span>{item.productName}</span>
                            <span className="font-semibold">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
