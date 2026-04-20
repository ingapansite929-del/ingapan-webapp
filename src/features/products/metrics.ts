import { createClient } from "@/lib/supabase/server";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

interface ProductCategoryRow {
  id: number;
  category: string;
}

interface ProductRelationRow {
  id: number;
  nome: string;
  product_categoria?: ProductCategoryRow[] | ProductCategoryRow | null;
}

interface TopViewedProductRow {
  views_count: number;
  updated_at: string;
  products: ProductRelationRow[] | ProductRelationRow | null;
}

interface TopOrderedProductRow {
  units_sold: number;
  orders_count: number;
  updated_at: string;
  products: ProductRelationRow[] | ProductRelationRow | null;
}

export interface TopViewedProductMetric {
  productId: number;
  productName: string;
  categoryName: string | null;
  viewsCount: number;
  updatedAt: string;
}

export interface TopOrderedProductMetric {
  productId: number;
  productName: string;
  categoryName: string | null;
  unitsSold: number;
  ordersCount: number;
  updatedAt: string;
}

function normalizeLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(limit, MAX_LIMIT);
}

function normalizeProductRelation(
  relation: ProductRelationRow[] | ProductRelationRow | null | undefined
): ProductRelationRow | null {
  if (!relation) return null;
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function normalizeCategoryName(
  relation: ProductCategoryRow[] | ProductCategoryRow | null | undefined
): string | null {
  if (!relation) return null;
  const category = Array.isArray(relation) ? (relation[0] ?? null) : relation;
  return category?.category ?? null;
}

async function fetchTopViewedProducts(limit: number): Promise<TopViewedProductMetric[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_stats")
    .select("views_count, updated_at, products!inner(id, nome, product_categoria(id, category))")
    .order("views_count", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erro ao carregar produtos mais acessados: ${error.message}`);
  }

  const rows = (data ?? []) as TopViewedProductRow[];
  return rows
    .map((row) => {
      const product = normalizeProductRelation(row.products);
      if (!product) return null;

      return {
        productId: product.id,
        productName: product.nome,
        categoryName: normalizeCategoryName(product.product_categoria),
        viewsCount: row.views_count,
        updatedAt: row.updated_at,
      } satisfies TopViewedProductMetric;
    })
    .filter((row): row is TopViewedProductMetric => row !== null);
}

async function fetchTopOrderedProducts(limit: number): Promise<TopOrderedProductMetric[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_sales_stats")
    .select("units_sold, orders_count, updated_at, products!inner(id, nome, product_categoria(id, category))")
    .order("units_sold", { ascending: false })
    .order("orders_count", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erro ao carregar produtos mais pedidos: ${error.message}`);
  }

  const rows = (data ?? []) as TopOrderedProductRow[];
  return rows
    .map((row) => {
      const product = normalizeProductRelation(row.products);
      if (!product) return null;

      return {
        productId: product.id,
        productName: product.nome,
        categoryName: normalizeCategoryName(product.product_categoria),
        unitsSold: row.units_sold,
        ordersCount: row.orders_count,
        updatedAt: row.updated_at,
      } satisfies TopOrderedProductMetric;
    })
    .filter((row): row is TopOrderedProductMetric => row !== null);
}

export async function getTopViewedProducts(limit = DEFAULT_LIMIT): Promise<TopViewedProductMetric[]> {
  // Keep this request-scoped to avoid cross-request cache artifacts in admin dashboard rendering.
  return fetchTopViewedProducts(normalizeLimit(limit));
}

export async function getTopOrderedProducts(limit = DEFAULT_LIMIT): Promise<TopOrderedProductMetric[]> {
  // This query is protected by RLS with auth.uid(), so it must run per-request with request cookies.
  return fetchTopOrderedProducts(normalizeLimit(limit));
}
