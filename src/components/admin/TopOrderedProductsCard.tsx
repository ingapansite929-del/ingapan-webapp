import Link from "next/link";
import { getTopOrderedProducts } from "@/features/products/metrics";

const LIST_LIMIT = 5;

function formatRelativeMinutes(isoDate: string | null): string | null {
  if (!isoDate) return null;

  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) return null;

  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  return `Atualizado há ${minutes} min`;
}

export function TopOrderedProductsCardSkeleton() {
  return (
    <article className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded bg-brand-dark/10" />
      <div className="mt-4 space-y-3">
        <div className="h-12 animate-pulse rounded-xl bg-brand-dark/5" />
        <div className="h-12 animate-pulse rounded-xl bg-brand-dark/5" />
        <div className="h-12 animate-pulse rounded-xl bg-brand-dark/5" />
      </div>
    </article>
  );
}

export default async function TopOrderedProductsCard() {
  let products: Awaited<ReturnType<typeof getTopOrderedProducts>> = [];
  let hasError = false;

  try {
    products = await getTopOrderedProducts(LIST_LIMIT);
  } catch (error) {
    console.error("[TopOrderedProductsCard] Failed to load ordered products metrics", error);
    hasError = true;
  }

  const latestUpdatedAt =
    products.length > 0
      ? products.reduce((latest, item) => (item.updatedAt > latest ? item.updatedAt : latest), products[0]!.updatedAt)
      : null;

  return (
    <article className="rounded-2xl border border-brand-dark/10 bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-dark">Top produtos mais pedidos</h2>
          {latestUpdatedAt ? (
            <p className="mt-1 text-xs text-brand-dark/60">{formatRelativeMinutes(latestUpdatedAt)}</p>
          ) : null}
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-semibold uppercase tracking-wide text-brand-red hover:underline"
        >
          Ver todos os produtos
        </Link>
      </header>

      {hasError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Erro ao carregar métricas
        </div>
      ) : products.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-brand-dark/20 bg-brand-light/40 px-4 py-8 text-center text-sm text-brand-dark/70">
          Nenhum dado disponível
        </div>
      ) : (
        <ol className="mt-4 space-y-2">
          {products.map((product, index) => (
            <li
              key={product.productId}
              className="flex items-center justify-between gap-3 rounded-xl border border-brand-dark/10 bg-brand-light/20 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-dark">
                  {index + 1}. {product.productName}
                </p>
                <p className="truncate text-xs text-brand-dark/60">
                  {product.categoryName ?? "Sem categoria"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-brand-dark">{product.unitsSold} unidades</p>
                <p className="text-xs text-brand-dark/60">{product.ordersCount} pedidos</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
