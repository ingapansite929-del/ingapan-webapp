import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
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
  categoria?: string | string[];
  status?: string | string[];
  error?: string | string[];
}>;

interface AdminProductsPageProps {
  searchParams: SearchParams;
}

interface Product {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  image_url: string;
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

function decodeMessage(value: string | string[] | undefined): string | null {
  const singleValue = getSingleValue(value);
  if (!singleValue) return null;

  try {
    return decodeURIComponent(singleValue);
  } catch {
    return singleValue;
  }
}

function getStatusMessage(status: string | string[] | undefined): string | null {
  const normalizedStatus = getSingleValue(status);
  if (normalizedStatus === "created") return "Produto criado com sucesso.";
  if (normalizedStatus === "updated") return "Produto atualizado com sucesso.";
  if (normalizedStatus === "deleted") return "Produto removido com sucesso.";
  return null;
}

function buildListUrl(page: number, nome: string, categoria: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (nome) params.set("nome", nome);
  if (categoria) params.set("categoria", categoria);
  return `/admin/products${params.toString() ? `?${params.toString()}` : ""}`;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const page = parsePositiveInt(params.page);
  const nome = getSingleValue(params.nome).trim();
  const categoria = getSingleValue(params.categoria).trim();

  const { supabase } = await requireAdminAccess();

  let query = supabase
    .from("products")
    .select("id, nome, categoria, descricao, image_url")
    .order("id", { ascending: false });

  if (nome) {
    query = query.ilike("nome", `${nome}%`);
  }

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const { data, error } = await query.range(from, to);

  const productRows = (data ?? []) as Product[];
  const hasNextPage = productRows.length > PAGE_SIZE;
  const products = hasNextPage ? productRows.slice(0, PAGE_SIZE) : productRows;
  const statusMessage = getStatusMessage(params.status);
  const errorMessage = decodeMessage(params.error);

  const nextPageUrl = buildListUrl(page + 1, nome, categoria);
  const previousPageUrl = buildListUrl(Math.max(page - 1, 1), nome, categoria);

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

      {/* Alertas Modernos */}
      <div className="flex flex-col gap-3">
        {statusMessage && (
          <div className="flex w-full animate-in fade-in slide-in-from-top-2 items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800 shadow-sm">
            <svg className="h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-bold">{statusMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="flex w-full animate-in fade-in slide-in-from-top-2 items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm">
            <svg className="h-5 w-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>
        )}

        {error && (
          <div className="flex w-full animate-in fade-in slide-in-from-top-2 items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm">
            <svg className="h-5 w-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-bold">Erro de conexão ao carregar produtos. Verifique os acessos.</p>
          </div>
        )}
      </div>

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

          <form action={createProductAction} className="flex flex-col gap-5 border-t border-brand-dark/5 pt-6">
            <div className="space-y-1.5 focus-within:text-brand-red text-brand-dark transition-colors">
              <label htmlFor="nome" className="text-sm font-bold uppercase tracking-wide">Nome da Peça</label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                minLength={2}
                maxLength={120}
                className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/20 px-4 py-3 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-dark/30 hover:border-brand-dark/30 focus:border-brand-red focus:bg-white focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                placeholder="Ex: Pão de Queijo Tradicional"
              />
            </div>

            <div className="space-y-1.5 focus-within:text-brand-red text-brand-dark transition-colors">
              <label htmlFor="categoria" className="text-sm font-bold uppercase tracking-wide">Categoria</label>
              <input
                id="categoria"
                name="categoria"
                type="text"
                required
                minLength={2}
                maxLength={80}
                className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/20 px-4 py-3 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-dark/30 hover:border-brand-dark/30 focus:border-brand-red focus:bg-white focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                placeholder="Ex: Pães, Confeitaria..."
              />
            </div>

            <div className="space-y-1.5 focus-within:text-brand-red text-brand-dark transition-colors">
              <label htmlFor="image_url" className="text-sm font-bold uppercase tracking-wide">URL Mídia</label>
              <input
                id="image_url"
                name="image_url"
                type="text"
                required
                className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/20 px-4 py-3 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-dark/30 hover:border-brand-dark/30 focus:border-brand-red focus:bg-white focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                placeholder="/images/produto.jpg ou link externo"
              />
            </div>

            <div className="space-y-1.5 focus-within:text-brand-red text-brand-dark transition-colors">
              <label htmlFor="descricao" className="text-sm font-bold uppercase tracking-wide">Descrição Completa</label>
              <textarea
                id="descricao"
                name="descricao"
                required
                minLength={5}
                maxLength={2000}
                rows={4}
                className="w-full resize-none rounded-xl border-2 border-brand-dark/10 bg-brand-light/20 px-4 py-3 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-dark/30 hover:border-brand-dark/30 focus:border-brand-red focus:bg-white focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                placeholder="Destaques, ingredientes, peso..."
              />
            </div>

            <SubmitButton
              label="Publicar Novo Item"
              pendingLabel="Registrando..."
              className="mt-4 w-full rounded-xl bg-brand-red px-4 py-4 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] transition-all hover:translate-y-[-2px] hover:bg-brand-red/90 hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] focus:outline-none focus:ring-4 focus:ring-brand-red/20 disabled:pointer-events-none disabled:opacity-70"
            />
          </form>
        </aside>

        {/* Workspace Central: Listagem */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-6 rounded-[2rem] border border-brand-dark/5 bg-white p-6 shadow-sm sm:p-8">
            
            {/* Nav Listagem + Filtros */}
            <div className="flex flex-col gap-5 border-b border-brand-dark/5 pb-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark font-heading">Itens em Catálogo</h2>
                <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-brand-dark/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span>Página {page} navegando até {PAGE_SIZE} resultados.</span>
                </div>
              </div>

              <form method="get" className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
                <div className="relative flex-1 xl:w-56">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/30"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input
                    name="nome"
                    defaultValue={nome}
                    placeholder="Filtrar via Nome"
                    className="w-full rounded-xl border-2 border-brand-dark/5 bg-brand-light/30 py-2.5 pl-10 pr-4 text-sm font-semibold text-brand-dark outline-none transition-all placeholder:font-medium placeholder:text-brand-dark/40 hover:bg-brand-light/60 focus:border-brand-dark/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
                  />
                </div>
                <div className="relative flex-1 xl:w-44">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/30"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  <input
                    name="categoria"
                    defaultValue={categoria}
                    placeholder="Categoria"
                    className="w-full rounded-xl border-2 border-brand-dark/5 bg-brand-light/30 py-2.5 pl-10 pr-4 text-sm font-semibold text-brand-dark outline-none transition-all placeholder:font-medium placeholder:text-brand-dark/40 hover:bg-brand-light/60 focus:border-brand-dark/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-dark px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-dark/90 active:scale-95 sm:py-3"
                >
                  Filtrar
                </button>
              </form>
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
                            {product.categoria}
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
                        <form action={deleteProductAction} className="w-full sm:w-auto">
                          <input type="hidden" name="id" value={product.id} />
                          <SubmitButton
                            label="Deletar Item"
                            pendingLabel="Deletando..."
                            className="w-full rounded-xl border-2 border-transparent bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-600/20 disabled:pointer-events-none disabled:opacity-60"
                          />
                        </form>
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
                        <form action={updateProductAction} className="grid gap-6">
                          <input type="hidden" name="id" value={product.id} />

                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-1.5 focus-within:text-brand-orange text-brand-dark transition-colors">
                              <label className="text-sm font-bold uppercase tracking-wide">Modificar Nome</label>
                              <input
                                name="nome"
                                defaultValue={product.nome}
                                minLength={2}
                                maxLength={120}
                                required
                                className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/30 px-4 py-3 text-sm font-semibold text-brand-dark outline-none transition-all hover:border-brand-dark/30 focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)]"
                              />
                            </div>
                            <div className="space-y-1.5 focus-within:text-brand-orange text-brand-dark transition-colors">
                              <label className="text-sm font-bold uppercase tracking-wide">Nova Categoria</label>
                              <input
                                name="categoria"
                                defaultValue={product.categoria}
                                minLength={2}
                                maxLength={80}
                                required
                                className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/30 px-4 py-3 text-sm font-semibold text-brand-dark outline-none transition-all hover:border-brand-dark/30 focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5 focus-within:text-brand-orange text-brand-dark transition-colors">
                            <label className="text-sm font-bold uppercase tracking-wide">Atualizar Endereço da Imagem</label>
                            <input
                              name="image_url"
                              defaultValue={product.image_url}
                              required
                              className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/30 px-4 py-3 text-sm font-semibold text-brand-dark outline-none transition-all hover:border-brand-dark/30 focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)]"
                            />
                          </div>

                          <div className="space-y-1.5 focus-within:text-brand-orange text-brand-dark transition-colors">
                            <label className="text-sm font-bold uppercase tracking-wide">Reescrever Descrição</label>
                            <textarea
                              name="descricao"
                              defaultValue={product.descricao}
                              minLength={5}
                              maxLength={2000}
                              required
                              rows={3}
                              className="w-full resize-none rounded-xl border-2 border-brand-dark/10 bg-brand-light/30 px-4 py-3 text-sm font-semibold text-brand-dark outline-none transition-all hover:border-brand-dark/30 focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)]"
                            />
                          </div>

                          <div className="mt-2 flex flex-col justify-end gap-3 sm:flex-row">
                            <SubmitButton
                              label="Salvar Alterações Desse Item"
                              pendingLabel="Gravando..."
                              className="w-full rounded-xl bg-brand-dark px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:translate-y-[-2px] hover:bg-brand-dark/90 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-dark/20 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
                            />
                          </div>
                        </form>
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
