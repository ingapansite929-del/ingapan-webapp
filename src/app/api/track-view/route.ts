import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|headless|preview|monitor|curl|wget|python-requests|httpclient/i;

function parseProductId(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function isBotRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent")?.trim() ?? "";
  if (!userAgent) {
    return true;
  }

  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

export async function POST(request: NextRequest) {
  if (isBotRequest(request)) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const productId =
    payload && typeof payload === "object"
      ? parseProductId((payload as { productId?: unknown }).productId)
      : null;

  if (!productId) {
    return NextResponse.json({ error: "productId inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_product_view", {
    target_product_id: productId,
  });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível registrar a visualização." },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}

