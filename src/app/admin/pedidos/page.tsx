import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getLatestAdminOrders } from "@/features/orders/data";
import type { AdminOrderSummary } from "@/features/orders/types";
import { requireAdminAccess } from "@/lib/auth/admin";

const ptBrDateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function AdminOrdersPage() {
  await requireAdminAccess();

  let orders: AdminOrderSummary[] = [];
  let ordersError: string | null = null;

  try {
    orders = await getLatestAdminOrders(10);
  } catch {
    ordersError = "Não foi possível carregar os pedidos de clientes.";
  }

  return (
    <section className="space-y-6">
      <div>
        <Badge variant="secondary">Relacionamento</Badge>
        <h1 className="mt-3 text-3xl font-bold">Pedidos</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Acompanhe os pedidos recebidos via WhatsApp e seus itens.
        </p>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-dark">
            Últimos 10 pedidos
          </h2>

          {ordersError ? (
            <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {ordersError}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground">
              Ainda não há pedidos registrados.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                    <div>
                      <p className="text-sm font-semibold">
                        Pedido #{order.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ptBrDateTime.format(new Date(order.createdAt))}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-yellow/20 px-2.5 py-1 text-xs font-medium text-brand-orange">
                      {order.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}{" "}
                      itens
                    </span>
                  </header>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Cliente</p>
                      <p className="font-medium">
                        {order.profileName ??
                          order.customerName ??
                          "Visitante"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {order.profileEmail ??
                          order.customerEmail ??
                          "Não informado"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground">Sessão</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {order.sessionId}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 rounded-xl bg-muted/40 p-3">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 text-sm"
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
      </Card>
    </section>
  );
}
