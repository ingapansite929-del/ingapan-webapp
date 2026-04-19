import { createClient } from "@/lib/supabase/server";
import type { AdminClientsAnalytics, ClientGrowthPoint, ClientExportRow, TopClientMetric } from "./types";

const CLIENT_ROLE = "cliente_ingapan";
const ORDERS_PAGE_SIZE = 1000;
const GROWTH_WEEKS = 12;
const GROWTH_MONTHS = 12;
const TOP_CLIENTS_LIMIT = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface DbClientRow {
  id: string;
  nome: string | null;
  email: string | null;
  created_at: string;
}

interface DbClientOrderRow {
  user_id: string | null;
  created_at: string;
}

function toIsoWeekKey(input: Date): string {
  const date = new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
  const dayNumber = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((date.getTime() - yearStart.getTime()) / MS_PER_DAY) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function monthKeyFromDate(input: Date): string {
  return `${input.getUTCFullYear()}-${String(input.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatWeekLabel(key: string): string {
  const [year, week] = key.split("-W");
  return `Sem ${week}/${year.slice(-2)}`;
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${month}/${year}`;
}

function buildRecentWeekKeys(total: number): string[] {
  const keys: string[] = [];
  const now = new Date();

  for (let offset = total - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    date.setUTCDate(date.getUTCDate() - offset * 7);
    keys.push(toIsoWeekKey(date));
  }

  return keys;
}

function buildRecentMonthKeys(total: number): string[] {
  const keys: string[] = [];
  const now = new Date();

  for (let offset = total - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    keys.push(monthKeyFromDate(date));
  }

  return keys;
}

function toGrowthSeries(
  keys: string[],
  totalsByKey: Map<string, number>,
  formatLabel: (key: string) => string
): ClientGrowthPoint[] {
  return keys.map((key) => ({
    key,
    label: formatLabel(key),
    total: totalsByKey.get(key) ?? 0,
  }));
}

function parseTimestamp(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export async function getAdminClientsAnalytics(
  supabase: ServerSupabaseClient
): Promise<AdminClientsAnalytics> {
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, email, created_at")
    .eq("role", CLIENT_ROLE)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao carregar clientes para analytics: ${error.message}`);
  }

  const clients = (data ?? []) as DbClientRow[];
  const clientIds = new Set(clients.map((client) => client.id));

  const now = Date.now();
  const activeThreshold = now - 30 * MS_PER_DAY;
  const ordersCountByUser = new Map<string, number>();
  const lastOrderByUser = new Map<string, number>();
  const activeUserIds = new Set<string>();

  let from = 0;
  while (true) {
    const to = from + ORDERS_PAGE_SIZE - 1;
    const { data: orderData, error: ordersError } = await supabase
      .from("client_orders")
      .select("user_id, created_at")
      .not("user_id", "is", null)
      .order("id", { ascending: true })
      .range(from, to);

    if (ordersError) {
      throw new Error(`Erro ao carregar pedidos para analytics: ${ordersError.message}`);
    }

    const orderRows = (orderData ?? []) as DbClientOrderRow[];
    for (const row of orderRows) {
      const userId = row.user_id;
      if (!userId || !clientIds.has(userId)) {
        continue;
      }

      ordersCountByUser.set(userId, (ordersCountByUser.get(userId) ?? 0) + 1);
      const createdAtTs = parseTimestamp(row.created_at);
      if (createdAtTs === null) {
        continue;
      }

      const previousLastOrder = lastOrderByUser.get(userId);
      if (!previousLastOrder || createdAtTs > previousLastOrder) {
        lastOrderByUser.set(userId, createdAtTs);
      }

      if (createdAtTs >= activeThreshold) {
        activeUserIds.add(userId);
      }
    }

    if (orderRows.length < ORDERS_PAGE_SIZE) {
      break;
    }

    from += ORDERS_PAGE_SIZE;
  }

  const weeklyTotals = new Map<string, number>();
  const monthlyTotals = new Map<string, number>();

  for (const client of clients) {
    const createdAtTs = parseTimestamp(client.created_at);
    if (createdAtTs === null) {
      continue;
    }

    const createdAtDate = new Date(createdAtTs);
    const weekKey = toIsoWeekKey(createdAtDate);
    const monthKey = monthKeyFromDate(createdAtDate);
    weeklyTotals.set(weekKey, (weeklyTotals.get(weekKey) ?? 0) + 1);
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) ?? 0) + 1);
  }

  const requestedQuoteClients = clients.reduce((total, client) => {
    return total + ((ordersCountByUser.get(client.id) ?? 0) > 0 ? 1 : 0);
  }, 0);

  const exportRows: ClientExportRow[] = clients.map((client) => ({
    id: client.id,
    name: client.nome,
    email: client.email,
    createdAt: client.created_at,
    ordersCount: ordersCountByUser.get(client.id) ?? 0,
  }));

  const topClients: TopClientMetric[] = exportRows
    .filter((client) => client.ordersCount > 0)
    .map((client) => {
      const lastOrderTimestamp = lastOrderByUser.get(client.id) ?? null;
      return {
      id: client.id,
      name: client.name,
      email: client.email,
      ordersCount: client.ordersCount,
      lastOrderAt: lastOrderTimestamp ? new Date(lastOrderTimestamp).toISOString() : null,
      };
    })
    .sort((a, b) => {
      if (b.ordersCount !== a.ordersCount) {
        return b.ordersCount - a.ordersCount;
      }

      const bLast = b.lastOrderAt ?? "";
      const aLast = a.lastOrderAt ?? "";
      if (bLast !== aLast) {
        return bLast.localeCompare(aLast);
      }

      return (a.name ?? "").localeCompare(b.name ?? "", "pt-BR", { sensitivity: "base" });
    })
    .slice(0, TOP_CLIENTS_LIMIT);

  const weeklyGrowth = toGrowthSeries(
    buildRecentWeekKeys(GROWTH_WEEKS),
    weeklyTotals,
    formatWeekLabel
  );
  const monthlyGrowth = toGrowthSeries(
    buildRecentMonthKeys(GROWTH_MONTHS),
    monthlyTotals,
    formatMonthLabel
  );

  return {
    totalClients: clients.length,
    activeClientsLast30Days: activeUserIds.size,
    inactiveClientsLast30Days: Math.max(clients.length - activeUserIds.size, 0),
    requestedQuoteClients,
    neverInteractedClients: Math.max(clients.length - requestedQuoteClients, 0),
    weeklyGrowth,
    monthlyGrowth,
    topClients,
    exportRows,
  };
}

