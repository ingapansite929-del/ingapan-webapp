import { requireAdminAccess } from "@/lib/auth/admin";
import Link from "next/link";
import { getLatestAdminOrders } from "@/features/orders/data";
import type { AdminOrderSummary } from "@/features/orders/types";

type SearchParams = Promise<{
  tab?: string | string[];
}>;

interface AdminClientsPageProps {
  searchParams: SearchParams;
}

type AdminClientsTab = "pedidos" | "clientes";

function getSingleValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function getActiveTab(value: string | string[] | undefined): AdminClientsTab {
  return getSingleValue(value) === "clientes" ? "clientes" : "pedidos";
}

const ptBrDateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  await requireAdminAccess();
  const params = await searchParams;
  const activeTab = getActiveTab(params.tab);

  let orders: AdminOrderSummary[] = [];
  let ordersError: string | null = null;

  if (activeTab === "pedidos") {
    try {
      orders = await getLatestAdminOrders(10);
    } catch {
      ordersError = "Não foi possível carregar os pedidos de clientes.";
    }
  }

  return (
    <section className="space-y-6 rounded-xl bg-white p-8 shadow-sm">
      <div>
        <span className="inline-flex rounded-lg bg-brand-red/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-red">
          Módulo ativo
        </span>
        <h1 className="mt-4 text-2xl font-bold font-heading text-brand-dark">
          Gestão de clientes
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-brand-dark/70">
          Acompanhe os pedidos recebidos via WhatsApp e monitore rapidamente os
          últimos movimentos.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-brand-dark/5 bg-brand-light/40 p-3">
        <Link
          href="/admin/clientes"
          scroll={false}
          className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide transition ${
            activeTab === "pedidos"
              ? "bg-brand-dark text-white"
              : "bg-white text-brand-dark hover:bg-brand-light"
          }`}
        >
          Pedidos de clientes
        </Link>
        <Link
          href="/admin/clientes?tab=clientes"
          scroll={false}
          className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide transition ${
            activeTab === "clientes"
              ? "bg-brand-dark text-white"
              : "bg-white text-brand-dark hover:bg-brand-light"
          }`}
        >
          Clientes
        </Link>
      </div>

      {activeTab === "pedidos" ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-dark">Últimos 10 pedidos</h2>

          {ordersError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {ordersError}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brand-dark/20 bg-brand-light/40 px-4 py-10 text-center text-sm text-brand-dark/70">
              Ainda não há pedidos registrados.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm"
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

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-brand-dark/60">Cliente</p>
                      <p className="font-medium text-brand-dark">
                        {order.profileName ?? order.customerName ?? "Visitante"}
                      </p>
                    </div>
                    <div>
                      <p className="text-brand-dark/60">Email</p>
                      <p className="font-medium text-brand-dark">
                        {order.profileEmail ?? order.customerEmail ?? "Não informado"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-brand-dark/60">Sessão</p>
                      <p className="font-mono text-xs text-brand-dark/70">
                        {order.sessionId}
                      </p>
                    </div>
                  </div>

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
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-brand-dark/20 bg-brand-light/40 px-4 py-10 text-center text-sm text-brand-dark/70">
          Novas ferramentas de cadastro e gestão de clientes serão adicionadas em
          breve nesta aba.
        </div>
      )}
    </section>
  );
}
