import { createClient } from "@/lib/supabase/server";
import type { AdminOrderSummary, OrderItemSummary, OrderSummary } from "@/features/orders/types";

const ORDER_SELECT =
  "id, session_id, user_id, customer_name, customer_email, created_at, client_order_items(id, product_id, product_name_snapshot, quantity)";

interface DbOrderItemRow {
  id: number;
  product_id: number | null;
  product_name_snapshot: string;
  quantity: number;
}

interface DbOrderRow {
  id: number;
  session_id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
  client_order_items?: DbOrderItemRow[] | null;
}

interface DbClientProfile {
  id: string;
  nome: string | null;
  email: string | null;
}

function normalizeOrderItems(items: DbOrderItemRow[] | null | undefined): OrderItemSummary[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name_snapshot,
    quantity: item.quantity,
  }));
}

function normalizeOrder(order: DbOrderRow): OrderSummary {
  return {
    id: order.id,
    sessionId: order.session_id,
    userId: order.user_id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    createdAt: order.created_at,
    items: normalizeOrderItems(order.client_order_items),
  };
}

export async function getLatestAdminOrders(limit = 10): Promise<AdminOrderSummary[]> {
  const supabase = await createClient();
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

  const { data, error } = await supabase
    .from("client_orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Erro ao carregar pedidos para admin: ${error.message}`);
  }

  const orders = (data ?? []) as DbOrderRow[];
  const userIds = [...new Set(orders.map((order) => order.user_id).filter(Boolean))] as string[];

  let profilesById = new Map<string, DbClientProfile>();
  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("clientes")
      .select("id, nome, email")
      .in("id", userIds);

    if (profilesError) {
      throw new Error(`Erro ao carregar clientes dos pedidos: ${profilesError.message}`);
    }

    const profiles = (profilesData ?? []) as DbClientProfile[];
    profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  }

  return orders.map((row) => {
    const normalized = normalizeOrder(row);
    const profile = row.user_id ? profilesById.get(row.user_id) : null;

    return {
      ...normalized,
      profileName: profile?.nome ?? null,
      profileEmail: profile?.email ?? null,
    };
  });
}

export async function getOrdersByUserId(userId: string, limit = 10): Promise<OrderSummary[]> {
  const supabase = await createClient();
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

  const { data, error } = await supabase
    .from("client_orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Erro ao carregar pedidos do cliente: ${error.message}`);
  }

  return ((data ?? []) as DbOrderRow[]).map(normalizeOrder);
}

