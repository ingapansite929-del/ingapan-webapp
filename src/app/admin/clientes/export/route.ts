import { requireAdminAccess } from "@/lib/auth/admin";
import { getAdminClientsAnalytics } from "@/features/clients/data";

export const runtime = "nodejs";

const ptBrDateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function safeDateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : ptBrDateTime.format(date);
}

function sanitizeTsvCell(value: string): string {
  return value.replaceAll("\t", " ").replaceAll("\r", " ").replaceAll("\n", " ");
}

export async function GET() {
  const { supabase } = await requireAdminAccess({
    forbiddenRedirectPath: "/dashboard",
  });
  const analytics = await getAdminClientsAnalytics(supabase);

  const header = ["Nome", "Email", "Data de Criacao", "Quantidade de Pedidos"].map(sanitizeTsvCell);
  const rows = analytics.exportRows.map((client) => [
    client.name ?? "",
    client.email ?? "",
    safeDateLabel(client.createdAt),
    String(client.ordersCount),
  ].map(sanitizeTsvCell));
  const tsv = [header, ...rows]
    .map((row) => row.join("\t"))
    .join("\r\n");
  const excelContent = `\uFEFF${tsv}`;

  const dateLabel = new Date().toISOString().slice(0, 10);
  const filename = `clientes-ingapan-${dateLabel}.xls`;

  return new Response(excelContent, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

