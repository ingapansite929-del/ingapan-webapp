import Link from "next/link";
import { CreateProductForm, UpdateProductForm, DeleteProductButton } from "@/components/admin/ProductForms";
import ProductFilters from "@/components/admin/ProductFilters";
import { requireAdminAccess } from "@/lib/auth/admin";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import Image from "next/image";

type SearchParams = Promise<{
  page?: string | string[];
  nome?: string | string[];
  categoria_id?: string | string[];
}>;

interface AdminProductsPageProps {
  searchParams: SearchParams;
}

interface Product {
  id: number;
  nome: string;
  id_categoria: number;
  descricao: string;
  image_url: string;
  product_categoria?: { id: number; category: string } | { id: number; category: string }[] | null;
}

interface ProductCategory {
  id: number;
  category: string;
}

const PAGE_SIZE = 15;

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

function buildListUrl(page: number, nome: string, categoriaId: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (nome) params.set("nome", nome);
  if (categoriaId) params.set("categoria_id", categoriaId);
  return `/admin/products${params.toString() ? `?${params.toString()}` : ""}`;
}

function getProductCategoryName(product: Product): string {
  const categoryRelation = product.product_categoria;
  if (Array.isArray(categoryRelation)) {
    return categoryRelation[0]?.category ?? "Sem categoria";
  }
  return categoryRelation?.category ?? "Sem categoria";
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const page = parsePositiveInt(params.page);
  const nome = getSingleValue(params.nome).trim();
  const categoriaId = getSingleValue(params.categoria_id).trim();

  const { supabase } = await requireAdminAccess();

  const { data: categoriesData } = await supabase
    .from("product_categoria")
    .select("id, category")
    .order("category", { ascending: true });
  const categories = (categoriesData ?? []) as ProductCategory[];

  let query = supabase
    .from("products")
    .select("id, nome, id_categoria, descricao, image_url, product_categoria(id, category)")
    .order("id", { ascending: false });

  if (nome) {
    query = query.ilike("nome", `${nome}%`);
  }

  if (categoriaId) {
    const selectedCategoryId = Number(categoriaId);
    if (Number.isInteger(selectedCategoryId) && selectedCategoryId > 0) {
      query = query.eq("id_categoria", selectedCategoryId);
    }
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const { data, error } = await query.range(from, to);

  const productRows = (data ?? []) as Product[];
  const hasNextPage = productRows.length > PAGE_SIZE;
  const products = hasNextPage ? productRows.slice(0, PAGE_SIZE) : productRows;

  const nextPageUrl = buildListUrl(page + 1, nome, categoriaId);
  const previousPageUrl = buildListUrl(Math.max(page - 1, 1), nome, categoriaId);

  return (
    <section className="mx-auto flex max-w-[1400px] flex-col gap-8 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Cabeçalho Premium */}
      <header className="relative overflow-hidden rounded-[2rem] bg-brand-dark px-6 py-10 shadow-xl sm:px-10 sm:py-12">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-brand-red/20 blur-[80px]"></div>
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-brand-orange/20 blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm sm:h-12 sm:w-12">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange sm:h-6 sm:w-6"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>
              </span>
              <span className="rounded-md bg-brand-orange/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-brand-orange">
                Gestão de Catálogo
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white font-heading sm:text-4xl">
              Central de Produtos
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Cadastre novos itens, reestruture categorias e mantenha o seu inventário esteticamente organizado com máxima facilidade.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="group flex w-fit items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-lg sm:px-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
            Voltar ao Painel
          </Link>
        </div>
      </header>

      {/* Grid Principal UI */}
      <div className="grid items-start gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[440px_1fr]">
        
        {/* Barra Lateral Funcional: Criar Produto */}
        <aside className="sticky top-8 flex flex-col gap-6 rounded-[2rem] border border-brand-dark/5 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-dark font-heading">Novo Produto</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-dark/60">
              Preencha o formulário para indexar rapidamente peças ao portfólio.
            </p>
          </div>

          <CreateProductForm categories={categories} />
        </aside>

        {/* Workspace Central: Listagem */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-6 rounded-[2rem] border border-brand-dark/5 bg-white p-6 shadow-sm sm:p-8">
            
            {/* Nav Listagem + Filtros */}
            <div className="flex flex-col gap-5 border-b border-brand-dark/5 pb-6 xl:flex-row xl:flex-wrap xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark font-heading">Itens em Catálogo</h2>
                <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-brand-dark/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span>Página {page} até {PAGE_SIZE} resultados.</span>
                </div>
              </div>

              <ProductFilters categories={categories} />
            </div>

            {/* Listagem Core */}
            <div className="flex flex-col gap-4">
              {products.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-brand-dark/10 bg-brand-light/30 px-6 py-24 text-center transition-all hover:bg-brand-light/50">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-dark/30"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/><line x1="9" x2="13" y1="11" y2="11"/><line x1="11" x2="11" y1="9" y2="13"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">Sem Resultados Encontrados</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-brand-dark/50">
                      Os critérios selecionados não trouxeram resultados. Altere os filtros aplicados na barra de buscas acima ou crie um novo item.
                    </p>
                  </div>
                </div>
              ) : (
                products.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[1.5rem] border border-brand-dark/5 bg-white shadow-sm transition-all hover:translate-y-[-2px] hover:border-brand-dark/15 hover:shadow-lg"
                  >
                    {/* View Info Card */}
                    <div className="flex flex-col p-6 sm:flex-row sm:items-center sm:gap-6">
                      <div className="relative mb-5 h-40 w-full shrink-0 overflow-hidden rounded-2xl border border-brand-dark/5 bg-brand-light shadow-inner sm:mb-0 sm:h-32 sm:w-32">
                        <Image 
                          src={product.image_url} 
                          alt={product.nome} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-1 flex-col min-w-0 justify-center">
                        <div className="mb-2.5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-lg bg-brand-dark/5 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-brand-dark/50">
                            # {product.id}
                          </span>
                          <span className="inline-flex items-center rounded-lg border border-brand-yellow/30 bg-brand-yellow/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-brand-dark/70">
                            {getProductCategoryName(product)}
                          </span>
                        </div>
                        <h3 className="truncate text-xl font-bold text-brand-dark transition-colors group-hover:text-brand-orange sm:text-2xl">
                          {product.nome}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-brand-dark/50 line-clamp-2">
                          {product.descricao}
                        </p>
                      </div>

                      <div className="mt-5 flex shrink-0 items-center justify-end border-t border-brand-dark/5 pt-5 sm:mt-0 sm:border-0 sm:pt-0">
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </div>

                    {/* Extensão Dropdown / Modal Edição */}
                    <details className="group/edit border-t border-brand-dark/5 bg-brand-light/20">
                      <summary className="flex cursor-pointer list-none items-center justify-center gap-2 px-4 py-4 text-sm font-bold uppercase tracking-widest text-brand-dark/40 transition hover:bg-brand-dark/5 hover:text-brand-dark focus:outline-none">
                        <span className="flex items-center gap-2 group-open/edit:hidden">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          Abrir Opções de Edição
                        </span>
                        <span className="hidden items-center gap-2 group-open/edit:flex">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                          Ocultar Configurações
                        </span>
                      </summary>
                      <div className="border-t border-brand-dark/5 bg-white p-6 sm:p-8">
                        <UpdateProductForm product={product} categories={categories} />
                      </div>
                    </details>
                  </article>
                ))
              )}
            </div>

            {/* Controle de Paginação Customizado */}
            <div className="mt-6 flex items-center justify-between border-t border-brand-dark/5 pt-6">
              <Link
                href={previousPageUrl}
                className={`group flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                  page > 1
                    ? "bg-brand-dark/5 text-brand-dark hover:bg-brand-dark hover:text-white"
                    : "pointer-events-none bg-brand-light/50 text-brand-dark/20"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
                <span className="hidden sm:inline">Recuar</span>
              </Link>
              
              <div className="flex flex-col items-center rounded-xl bg-brand-light/40 px-6 py-2 shadow-inner border border-brand-dark/5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/50">
                  Folha
                </span>
                <span className="mt-0.5 text-base font-black text-brand-dark">
                  {page}
                </span>
              </div>

              <Link
                href={nextPageUrl}
                className={`group flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                  hasNextPage
                    ? "bg-brand-dark/5 text-brand-dark hover:bg-brand-dark hover:text-white"
                    : "pointer-events-none bg-brand-light/50 text-brand-dark/20"
                }`}
              >
                <span className="hidden sm:inline">Avançar</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
