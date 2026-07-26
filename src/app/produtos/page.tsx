import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsCatalogClient from "@/components/products/ProductsCatalogClient";
import ProductsCatalogSkeleton from "@/components/products/ProductsCatalogSkeleton";
import {
  buildProductsUrl,
  getSingleSearchValue,
  parsePositivePage,
  parseProductOrder,
  PRODUCT_PAGE_SIZE,
  type ProductCategoryOption,
  type ProductCatalogFilters,
  type ProductSubcategoryOption,
} from "@/features/products/catalog";
import { PRODUCT_SELECT } from "@/features/products/data";
import { parseProductRecords } from "@/features/products/types";
import { createClient } from "@/lib/supabase/server";

type ProductsSearchParams = {
  page?: string | string[];
  nome?: string | string[];
  categoria?: string | string[];
  subcategoria?: string | string[];
  ordem?: string | string[];
};

interface ProductsPageProps {
  searchParams: Promise<ProductsSearchParams>;
}

function resolveFilters(params: ProductsSearchParams): ProductCatalogFilters {
  return {
    nome: getSingleSearchValue(params.nome).trim(),
    categoria: getSingleSearchValue(params.categoria).trim(),
    subcategoria: getSingleSearchValue(params.subcategoria).trim(),
    ordem: parseProductOrder(params.ordem),
  };
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePositivePage(params.page);
  const filters = resolveFilters(params);
  const canonicalPath = buildProductsUrl(filters, page);
  const hasFilters = Boolean(
    filters.nome || filters.categoria || filters.subcategoria
  );
  const title = hasFilters
    ? "Catálogo de produtos filtrado"
    : page > 1
      ? `Catálogo de produtos - Página ${page}`
      : "Catálogo de produtos";
  const description = hasFilters
    ? "Explore os produtos filtrados da IngaPan para encontrar as melhores opções para o seu negócio."
    : "Explore o catálogo completo da IngaPan com produtos alimentícios para empresas.";

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: !hasFilters, follow: true },
    openGraph: {
      title: `${title} | IngaPan`,
      description,
      url: canonicalPath,
      type: "website",
      images: [{ url: "/images/LOGO.png", alt: "Logo da IngaPan" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | IngaPan`,
      description,
      images: ["/images/LOGO.png"],
    },
  };
}

async function ProductsCatalog({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const requestedPage = parsePositivePage(params.page);
  const filters = resolveFilters(params);
  const supabase = await createClient();

  const categoriesRequest = supabase
    .from("product_categoria")
    .select("id, category")
    .order("category", { ascending: true });
  const subcategoriesRequest = supabase
    .from("product_subcategory")
    .select("id, subcategoria")
    .order("subcategoria", { ascending: true });

  let productsRequest = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" });

  if (filters.nome) {
    productsRequest = productsRequest.ilike("nome", `%${filters.nome}%`);
  }

  const categoryId = Number(filters.categoria);
  if (Number.isInteger(categoryId) && categoryId > 0) {
    productsRequest = productsRequest.eq("id_categoria", categoryId);
  }

  const subcategoryId = Number(filters.subcategoria);
  if (Number.isInteger(subcategoryId) && subcategoryId > 0) {
    productsRequest = productsRequest.eq("id_subcategoria", subcategoryId);
  }

  const orderColumn = filters.ordem.startsWith("codigo") ? "id" : "nome";
  const ascending = filters.ordem.endsWith("asc");
  const from = (requestedPage - 1) * PRODUCT_PAGE_SIZE;
  productsRequest = productsRequest
    .order(orderColumn, { ascending })
    .range(from, from + PRODUCT_PAGE_SIZE - 1);

  const [categoriesResult, subcategoriesResult, productsResult] =
    await Promise.all([
      categoriesRequest,
      subcategoriesRequest,
      productsRequest,
    ]);

  if (categoriesResult.error) {
    throw new Error(
      `Não foi possível carregar as categorias: ${categoriesResult.error.message}`
    );
  }
  if (subcategoriesResult.error) {
    throw new Error(
      `Não foi possível carregar as subcategorias: ${subcategoriesResult.error.message}`
    );
  }
  if (productsResult.error) {
    throw new Error(
      `Não foi possível carregar os produtos: ${productsResult.error.message}`
    );
  }

  const total = productsResult.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE));
  if (total > 0 && requestedPage > pageCount) {
    redirect(buildProductsUrl(filters, pageCount));
  }

  const categories =
    (categoriesResult.data as ProductCategoryOption[] | null) ?? [];
  const subcategories =
    (subcategoriesResult.data as ProductSubcategoryOption[] | null) ?? [];
  const products = parseProductRecords(productsResult.data);

  return (
    <ProductsCatalogClient
      products={products}
      categories={categories}
      subcategories={subcategories}
      filters={filters}
      currentPage={requestedPage}
      pageCount={pageCount}
      total={total}
      pageSize={PRODUCT_PAGE_SIZE}
    />
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <>
      <Header />
      <main
        id="conteudo-principal"
        className="min-h-screen bg-gradient-to-b from-brand-light/30 to-background"
      >
        <section className="relative overflow-hidden bg-brand-dark pb-10 pt-28 md:pb-12 md:pt-32">
          <div className="pointer-events-none absolute -right-24 top-0 size-80 rounded-full bg-brand-yellow/10 blur-[100px]" />
          <div className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-brand-red/10 blur-[100px]" />
          <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-brand-yellow">
              Catálogo completo
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Encontre o produto certo para seu negócio
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Busque, combine categorias e subcategorias e adicione itens ao
              orçamento em poucos passos.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-10">
          <Suspense fallback={<ProductsCatalogSkeleton />}>
            <ProductsCatalog searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
