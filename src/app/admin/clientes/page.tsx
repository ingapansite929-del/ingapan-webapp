import { requireAdminAccess } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import { getAdminClientsAnalytics } from "@/features/clients/data";
import type { AdminClientsAnalytics } from "@/features/clients/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type SearchParams = Promise<{
  tab?: string | string[];
}>;

interface AdminClientsPageProps {
  searchParams: SearchParams;
}

function getSingleValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

const ptBrDateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const ptBrDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export default async function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  const params = await searchParams;
  const legacyTab = getSingleValue(params.tab);
  if (legacyTab === "pedidos") redirect("/admin/pedidos");
  if (legacyTab) redirect("/admin/clientes");

  const { supabase } = await requireAdminAccess();
  let clientsAnalytics: AdminClientsAnalytics | null = null;
  let clientsError: string | null = null;

  try {
    clientsAnalytics = await getAdminClientsAnalytics(supabase);
  } catch {
    clientsError = "Não foi possível carregar os indicadores de clientes.";
  }

  return (
    <section className="space-y-6">
      <div>
        <Badge variant="secondary">Relacionamento</Badge>
        <h1 className="mt-3 text-3xl font-bold">
          Clientes
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Acompanhe crescimento, atividade e engajamento da base de clientes.
        </p>
      </div>

      <Card className="p-5 sm:p-6">
      {clientsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {clientsError}
        </div>
      ) : clientsAnalytics ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-dark/10 bg-brand-light/30 px-4 py-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-dark">Indicadores de clientes</h2>
              <p className="text-sm text-brand-dark/70">
                Crescimento, atividade, engajamento e ranking de pedidos.
              </p>
            </div>
            <a
              href="/admin/clientes/export"
              className="inline-flex items-center rounded-xl bg-brand-dark px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark/90"
            >
              Exportar Excel
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-brand-dark/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/60">
                Clientes cadastrados
              </p>
              <p className="mt-2 text-3xl font-bold text-brand-dark">{clientsAnalytics.totalClients}</p>
            </article>
            <article className="rounded-2xl border border-brand-dark/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/60">
                Ativos (últimos 30 dias)
              </p>
              <p className="mt-2 text-3xl font-bold text-brand-dark">
                {clientsAnalytics.activeClientsLast30Days}
              </p>
            </article>
            <article className="rounded-2xl border border-brand-dark/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/60">
                Pediram orçamento
              </p>
              <p className="mt-2 text-3xl font-bold text-brand-dark">
                {clientsAnalytics.requestedQuoteClients}
              </p>
            </article>
            <article className="rounded-2xl border border-brand-dark/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/60">
                Nunca interagiram
              </p>
              <p className="mt-2 text-3xl font-bold text-brand-dark">
                {clientsAnalytics.neverInteractedClients}
              </p>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-brand-dark">Crescimento semanal</h3>
              <p className="mt-1 text-sm text-brand-dark/60">Novos clientes por semana</p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-dark/10 text-sm">
                  <thead>
                    <tr className="text-left text-brand-dark/60">
                      <th className="px-2 py-2 font-medium">Período</th>
                      <th className="px-2 py-2 font-medium">Novos clientes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark/5">
                    {clientsAnalytics.weeklyGrowth.map((point) => (
                      <tr key={point.key}>
                        <td className="px-2 py-2 text-brand-dark">{point.label}</td>
                        <td className="px-2 py-2 font-semibold text-brand-dark">{point.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-brand-dark">Crescimento mensal</h3>
              <p className="mt-1 text-sm text-brand-dark/60">Novos clientes por mês</p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-dark/10 text-sm">
                  <thead>
                    <tr className="text-left text-brand-dark/60">
                      <th className="px-2 py-2 font-medium">Período</th>
                      <th className="px-2 py-2 font-medium">Novos clientes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark/5">
                    {clientsAnalytics.monthlyGrowth.map((point) => (
                      <tr key={point.key}>
                        <td className="px-2 py-2 text-brand-dark">{point.label}</td>
                        <td className="px-2 py-2 font-semibold text-brand-dark">{point.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-brand-dark">Atividade (últimos 30 dias)</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-brand-dark/10 bg-brand-light/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-brand-dark/60">Ativos</p>
                  <p className="mt-1 text-2xl font-bold text-brand-dark">
                    {clientsAnalytics.activeClientsLast30Days}
                  </p>
                </div>
                <div className="rounded-xl border border-brand-dark/10 bg-brand-light/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-brand-dark/60">Inativos</p>
                  <p className="mt-1 text-2xl font-bold text-brand-dark">
                    {clientsAnalytics.inactiveClientsLast30Days}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-brand-dark">Engajamento</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-brand-dark/10 bg-brand-light/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-brand-dark/60">
                    Já pediram orçamento
                  </p>
                  <p className="mt-1 text-2xl font-bold text-brand-dark">
                    {clientsAnalytics.requestedQuoteClients}
                  </p>
                </div>
                <div className="rounded-xl border border-brand-dark/10 bg-brand-light/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-brand-dark/60">
                    Nunca interagiram
                  </p>
                  <p className="mt-1 text-2xl font-bold text-brand-dark">
                    {clientsAnalytics.neverInteractedClients}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-brand-dark">Top clientes</h3>
            <p className="mt-1 text-sm text-brand-dark/60">
              Clientes que mais pediram orçamento via WhatsApp.
            </p>
            {clientsAnalytics.topClients.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-brand-dark/20 bg-brand-light/40 px-4 py-8 text-center text-sm text-brand-dark/70">
                Ainda não há clientes com pedidos para exibir ranking.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-dark/10 text-sm">
                  <thead>
                    <tr className="text-left text-brand-dark/60">
                      <th className="px-2 py-2 font-medium">Cliente</th>
                      <th className="px-2 py-2 font-medium">Email</th>
                      <th className="px-2 py-2 font-medium">Pedidos</th>
                      <th className="px-2 py-2 font-medium">Último pedido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark/5">
                    {clientsAnalytics.topClients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-2 py-2 text-brand-dark">
                          {client.name ?? "Cliente sem nome"}
                        </td>
                        <td className="px-2 py-2 text-brand-dark/80">
                          {client.email ?? "Não informado"}
                        </td>
                        <td className="px-2 py-2 font-semibold text-brand-dark">
                          {client.ordersCount}
                        </td>
                        <td className="px-2 py-2 text-brand-dark/80">
                          {client.lastOrderAt
                            ? ptBrDateTime.format(new Date(client.lastOrderAt))
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-brand-dark">Base para exportação</h3>
            <p className="mt-1 text-sm text-brand-dark/60">
              Prévia dos clientes com nome, email, data de criação e total de pedidos.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-dark/10 text-sm">
                <thead>
                  <tr className="text-left text-brand-dark/60">
                    <th className="px-2 py-2 font-medium">Nome</th>
                    <th className="px-2 py-2 font-medium">Email</th>
                    <th className="px-2 py-2 font-medium">Cadastro</th>
                    <th className="px-2 py-2 font-medium">Pedidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/5">
                  {clientsAnalytics.exportRows.slice(0, 20).map((client) => (
                    <tr key={client.id}>
                      <td className="px-2 py-2 text-brand-dark">{client.name ?? "-"}</td>
                      <td className="px-2 py-2 text-brand-dark/80">{client.email ?? "-"}</td>
                      <td className="px-2 py-2 text-brand-dark/80">
                        {ptBrDate.format(new Date(client.createdAt))}
                      </td>
                      <td className="px-2 py-2 font-semibold text-brand-dark">
                        {client.ordersCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {clientsAnalytics.exportRows.length > 20 ? (
              <p className="mt-3 text-xs text-brand-dark/60">
                Exibindo 20 de {clientsAnalytics.exportRows.length} clientes. Use o botão
                “Exportar Excel” para baixar a base completa.
              </p>
            ) : null}
          </section>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-brand-dark/20 bg-brand-light/40 px-4 py-10 text-center text-sm text-brand-dark/70">
          Nenhum dado de clientes disponível no momento.
        </div>
      )}
      </Card>
    </section>
  );
}
