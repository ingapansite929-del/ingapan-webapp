export const PRODUCT_PAGE_SIZE = 20;

export const PRODUCT_ORDER_OPTIONS = [
  { value: "nome-asc", label: "Nome A–Z" },
  { value: "nome-desc", label: "Nome Z–A" },
  { value: "codigo-asc", label: "Código crescente" },
  { value: "codigo-desc", label: "Código decrescente" },
] as const;

export type ProductOrder = (typeof PRODUCT_ORDER_OPTIONS)[number]["value"];

export interface ProductCatalogFilters {
  nome: string;
  categoria: string;
  subcategoria: string;
  ordem: ProductOrder;
}

export interface ProductCategoryOption {
  id: number;
  category: string;
}

export interface ProductSubcategoryOption {
  id: number;
  subcategoria: string;
}

export function getSingleSearchValue(
  value: string | string[] | undefined
): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export function parsePositivePage(
  value: string | string[] | undefined
): number {
  const parsed = Number(getSingleSearchValue(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function parseProductOrder(
  value: string | string[] | undefined
): ProductOrder {
  const candidate = getSingleSearchValue(value);
  return PRODUCT_ORDER_OPTIONS.some((option) => option.value === candidate)
    ? (candidate as ProductOrder)
    : "nome-asc";
}

export function buildProductsUrl(
  filters: ProductCatalogFilters,
  page = 1
): string {
  const params = new URLSearchParams();
  if (filters.nome) params.set("nome", filters.nome);
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.subcategoria) params.set("subcategoria", filters.subcategoria);
  if (filters.ordem !== "nome-asc") params.set("ordem", filters.ordem);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

export function getPaginationItems(
  currentPage: number,
  pageCount: number
): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < pageCount) pages.add(currentPage + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

export interface CatalogNavigationLock {
  tryStart: (href: string) => boolean;
  release: () => void;
  current: () => string | null;
}

export function createCatalogNavigationLock(): CatalogNavigationLock {
  let pendingHref: string | null = null;

  return {
    tryStart(href) {
      if (pendingHref) return false;
      pendingHref = href;
      return true;
    },
    release() {
      pendingHref = null;
    },
    current() {
      return pendingHref;
    },
  };
}

