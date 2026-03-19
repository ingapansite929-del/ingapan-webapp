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
      
      <main className="min-h-screen bg-gradient-to-b from-brand-light/30 to-white pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-brand-dark py-16 md:py-24">
          <div className="pointer-events-none absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-brand-yellow/10 blur-[120px]"></div>
          <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-red/10 blur-[120px]"></div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-2 backdrop-blur-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-yellow">
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider text-brand-yellow">Catálogo Completo</span>
              </div>
              
              <h1 className="font-[var(--font-heading)] text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                Nossos <span className="text-brand-yellow">Produtos</span>
              </h1>
              
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
                Explore nosso catálogo completo de produtos alimentícios de alta qualidade para o seu negócio.
              </p>
            </div>
          </div>
        </section>

        {/* Filtros e Produtos */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
