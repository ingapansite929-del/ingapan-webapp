import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsGrid from "@/components/ProductsGrid";
import ProductsFilters from "@/components/ProductsFilters";

type SearchParams = Promise<{
  page?: string | string[];
  nome?: string | string[];
  categoria?: string | string[];
}>;

type ResolvedSearchParams = {
  page?: string | string[];
  nome?: string | string[];
  categoria?: string | string[];
};

interface ProductsPageProps {
  searchParams: SearchParams;
}

interface Product {
  id: number;
  nome: string;
  id_categoria: number;
  descricao: string;
  image_url: string;
  product_categoria?: { id: number; category: string }[] | { id: number; category: string } | null;
}

interface ProductCategory {
  id: number;
  category: string;
}

const PAGE_SIZE = 20;

function getSingleValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function parsePositiveInt(value: string | string[] | undefined): number {
  const parsed = Number(getSingleValue(value));
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 1;
  }
  return parsed;
}

function buildCanonicalPath(page: number, nome: string, categoria: string): string {
  const search = new URLSearchParams();

  if (page > 1) {
    search.set("page", String(page));
  }

  if (nome) {
    search.set("nome", nome);
  }

  if (categoria) {
    search.set("categoria", categoria);
  }

  const searchString = search.toString();
  return searchString ? `/produtos?${searchString}` : "/produtos";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ResolvedSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePositiveInt(params.page);
  const nome = getSingleValue(params.nome).trim();
  const categoria = getSingleValue(params.categoria).trim();
  const canonicalPath = buildCanonicalPath(page, nome, categoria);
  const hasFilters = Boolean(nome || categoria);
  const title = hasFilters
    ? "Catálogo de produtos filtrado"
    : page > 1
      ? `Catálogo de produtos - Página ${page}`
      : "Catálogo de produtos";
  const description = hasFilters
    ? "Explore os produtos filtrados da Ingapan para encontrar opções ideais para sua empresa."
    : "Explore o catálogo completo da Ingapan com produtos alimentícios para empresas.";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: !hasFilters,
      follow: true,
    },
    openGraph: {
      title: `${title} | Ingapan`,
      description,
      url: canonicalPath,
      type: "website",
      images: [
        {
          url: "/images/LOGO.png",
          alt: "Logo da Ingapan",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Ingapan`,
      description,
      images: ["/images/LOGO.png"],
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = parsePositiveInt(params.page);
  const nome = getSingleValue(params.nome).trim();
  const categoria = getSingleValue(params.categoria).trim();

  const supabase = await createClient();

  // Buscar categorias para os filtros
  const { data: categoriesData } = await supabase
    .from("product_categoria")
    .select("id, category")
    .order("category", { ascending: true });
  const categories = (categoriesData ?? []) as ProductCategory[];

  // Query principal de produtos
  let query = supabase
    .from("products")
    .select("id, nome, id_categoria, descricao, image_url, product_categoria(id, category)")
    .order("nome", { ascending: true });

  // Filtro por nome
  if (nome) {
    query = query.ilike("nome", `%${nome}%`);
  }

  // Filtro por categoria
  if (categoria) {
    const selectedCategoryId = Number(categoria);
    if (Number.isInteger(selectedCategoryId) && selectedCategoryId > 0) {
      query = query.eq("id_categoria", selectedCategoryId);
    }
  }

  // Paginação: buscar PAGE_SIZE + 1 para saber se tem próxima página
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const { data } = await query.range(from, to);
  const productRows = (data ?? []) as Product[];
  const hasNextPage = productRows.length > PAGE_SIZE;
  const products = hasNextPage ? productRows.slice(0, PAGE_SIZE) : productRows;

  return (
    <>
      <Header />
      
      <main id="conteudo-principal" className="min-h-screen bg-gradient-to-b from-brand-light/30 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-brand-dark pb-16 pt-32 md:pb-24 md:pt-40">
          <div className="pointer-events-none absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-brand-yellow/10 blur-[120px]"></div>
          <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-red/10 blur-[120px]"></div>
          
          <div className="relative z-10 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-2 backdrop-blur-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-yellow">
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
                </svg>
                <span className="text-sm font-medium tracking-[0.14em] text-brand-yellow uppercase">Catálogo completo</span>
              </div>
              
              <h1 className="font-[var(--font-heading)] text-4xl font-bold tracking-[-0.02em] text-white md:text-5xl lg:text-6xl">
                Nossos <span className="text-brand-yellow">Produtos</span>
              </h1>
              
              <p className="mx-auto mt-4 max-w-[64ch] text-lg leading-relaxed text-gray-300 md:text-xl">
                Explore nosso catálogo completo de produtos alimentícios de alta qualidade para o seu negócio.
              </p>
            </div>
          </div>
        </section>

        {/* Filtros e Produtos */}
        <section className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10">
          <ProductsFilters 
            categories={categories} 
            currentNome={nome}
            currentCategoria={categoria}
          />

          <ProductsGrid 
            products={products}
            currentPage={page}
            hasNextPage={hasNextPage}
            currentNome={nome}
            currentCategoria={categoria}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
