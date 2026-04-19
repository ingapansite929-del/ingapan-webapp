import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SESSION_COOKIE_NAME = "ingapan_session_id";
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

interface CheckoutItemPayload {
  product_id: number;
  quantity: number;
}

interface CheckoutRequestPayload {
  items?: unknown;
}

function isValidSessionId(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.length > 128) return false;
  return /^[A-Za-z0-9_-]+$/.test(trimmed);
}

function sanitizeItems(items: unknown): CheckoutItemPayload[] | null {
  if (!Array.isArray(items) || items.length === 0 || items.length > 200) {
    return null;
  }

  const normalized = items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const rawProductId = (item as { product_id?: unknown }).product_id;
      const rawQuantity = (item as { quantity?: unknown }).quantity;
      const productId = Number(rawProductId);
      const quantity = Number(rawQuantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        return null;
      }

      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 999) {
        return null;
      }

      return { product_id: productId, quantity };
    })
    .filter((item): item is CheckoutItemPayload => item !== null);

  if (normalized.length === 0) {
    return null;
  }

  return normalized;
}

function resolveSessionId(request: NextRequest): { sessionId: string; created: boolean } {
  const existing = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? "";
  if (isValidSessionId(existing)) {
    return { sessionId: existing, created: false };
  }

  const fallback = crypto.randomUUID().replace(/-/g, "");
  return { sessionId: fallback, created: true };
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestPayload;

  try {
    body = (await request.json()) as CheckoutRequestPayload;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const items = sanitizeItems(body.items);
  if (!items) {
    return NextResponse.json({ error: "Itens do pedido inválidos." }, { status: 400 });
  }

  const { sessionId, created } = resolveSessionId(request);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_client_order", {
    p_session_id: sessionId,
    p_items: items,
  });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível registrar o pedido." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ success: true, orderId: data ?? null });

  if (created) {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionId,
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

