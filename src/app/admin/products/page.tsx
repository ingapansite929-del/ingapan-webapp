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
    <section className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-brand-red to-brand-orange p-6 text-white shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/80">Gestao de Catalogo</p>
            <h1 className="mt-2 text-3xl font-bold font-heading">Produtos</h1>
            <p className="mt-2 text-sm text-white/90">
              Cadastre, edite e exclua produtos.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </header>

      {statusMessage && (
        <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          Erro ao carregar produtos. Verifique RLS e permissao da tabela products.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
        <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark font-heading">Novo produto</h2>
          <p className="mt-1 text-sm text-brand-dark/60">
            Preencha os campos abaixo para adicionar um item ao catalogo.
          </p>

          <form action={createProductAction} className="mt-5 space-y-4">
            <div>
              <label htmlFor="nome" className="mb-1 block text-sm font-medium text-brand-dark">
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                minLength={2}
                maxLength={120}
                className="w-full rounded-lg border border-brand-dark/20 px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                placeholder="Ex: Pao Frances"
              />
            </div>

            <div>
              <label
                htmlFor="categoria"
                className="mb-1 block text-sm font-medium text-brand-dark"
              >
                Categoria
              </label>
              <input
                id="categoria"
                name="categoria"
                type="text"
                required
                minLength={2}
                maxLength={80}
                className="w-full rounded-lg border border-brand-dark/20 px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                placeholder="Ex: Padaria"
              />
            </div>

            <div>
              <label
                htmlFor="image_url"
                className="mb-1 block text-sm font-medium text-brand-dark"
              >
                URL da imagem
              </label>
              <input
                id="image_url"
                name="image_url"
                type="text"
                required
                className="w-full rounded-lg border border-brand-dark/20 px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                placeholder="https://... ou /images/produto.jpg"
              />
            </div>

            <div>
              <label
                htmlFor="descricao"
                className="mb-1 block text-sm font-medium text-brand-dark"
              >
                Descricao
              </label>
              <textarea
                id="descricao"
                name="descricao"
                required
                minLength={5}
                maxLength={2000}
                rows={4}
                className="w-full resize-y rounded-lg border border-brand-dark/20 px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                placeholder="Detalhes do produto"
              />
            </div>

            <SubmitButton
              label="Criar produto"
              pendingLabel="Criando..."
              className="w-full rounded-lg bg-brand-red px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red/90 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </div>

        <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-dark font-heading">Produtos cadastrados</h2>
              <p className="mt-1 text-sm text-brand-dark/60">
                Pagina {page} com ate {PAGE_SIZE} itens por consulta.
              </p>
            </div>

            <form method="get" className="grid w-full gap-2 sm:w-auto sm:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto]">
              <input
                name="nome"
                defaultValue={nome}
                placeholder="Buscar por prefixo do nome"
                className="rounded-lg border border-brand-dark/20 px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
              />
              <input
                name="categoria"
                defaultValue={categoria}
                placeholder="Filtrar categoria exata"
                className="rounded-lg border border-brand-dark/20 px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark/90"
              >
                Aplicar
              </button>
            </form>
          </div>

          <div className="mt-5 space-y-4">
            {products.length === 0 && !error ? (
              <div className="rounded-lg border border-dashed border-brand-dark/25 bg-brand-light px-4 py-6 text-center text-sm text-brand-dark/70">
                Nenhum produto encontrado com os filtros atuais.
              </div>
            ) : (
              products.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-xl border border-brand-dark/10 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-brand-dark/10 bg-brand-light shadow-inner sm:h-28 sm:w-28">
                      <Image 
                        src={product.image_url} 
                        alt={product.nome} 
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-brand-dark">{product.nome}</h3>
                        <span className="rounded bg-brand-dark/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-dark/50">
                          ID #{product.id}
                        </span>
                      </div>
                      <p className="mt-1.5 inline-flex items-center rounded-md bg-brand-yellow/20 px-2.5 py-1 text-xs font-semibold text-brand-dark/80 border border-brand-yellow/30">
                        {product.categoria}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-brand-dark/70 line-clamp-2">
                        {product.descricao}
                      </p>
                    </div>

                    <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-col sm:items-stretch">
                      <form action={deleteProductAction} className="w-full sm:w-auto">
                        <input type="hidden" name="id" value={product.id} />
                        <SubmitButton
                          label="Excluir produto"
                          pendingLabel="Excluindo..."
                          className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </form>
                    </div>
                  </div>

                  <details className="group/edit border-t border-brand-dark/5 bg-brand-light/30">
                    <summary className="flex cursor-pointer list-none items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-brand-dark/60 transition hover:bg-brand-dark/5 hover:text-brand-dark focus:outline-none">
                      <span className="group-open/edit:hidden">Editar Produto ▼</span>
                      <span className="hidden group-open/edit:inline">Fechar Edição ▲</span>
                    </summary>
                    <div className="border-t border-brand-dark/5 p-5 bg-white">
                      <form action={updateProductAction} className="grid gap-4">
                        <input type="hidden" name="id" value={product.id} />

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-brand-dark">Nome</label>
                            <input
                              name="nome"
                              defaultValue={product.nome}
                              minLength={2}
                              maxLength={120}
                              required
                              className="w-full rounded-lg border border-brand-dark/20 bg-brand-light/20 px-3 py-2.5 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:bg-white focus:ring-2 focus:ring-brand-red/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-brand-dark">Categoria</label>
                            <input
                              name="categoria"
                              defaultValue={product.categoria}
                              minLength={2}
                              maxLength={80}
                              required
                              className="w-full rounded-lg border border-brand-dark/20 bg-brand-light/20 px-3 py-2.5 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:bg-white focus:ring-2 focus:ring-brand-red/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-brand-dark">URL da imagem</label>
                          <input
                            name="image_url"
                            defaultValue={product.image_url}
                            required
                            className="w-full rounded-lg border border-brand-dark/20 bg-brand-light/20 px-3 py-2.5 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:bg-white focus:ring-2 focus:ring-brand-red/20"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-brand-dark">Descrição</label>
                          <textarea
                            name="descricao"
                            defaultValue={product.descricao}
                            minLength={5}
                            maxLength={2000}
                            required
                            rows={3}
                            className="w-full resize-y rounded-lg border border-brand-dark/20 bg-brand-light/20 px-3 py-2.5 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:bg-white focus:ring-2 focus:ring-brand-red/20"
                          />
                        </div>

                        <div className="mt-2 flex justify-end">
                          <SubmitButton
                            label="Salvar alterações"
                            pendingLabel="Salvando..."
                            className="rounded-lg bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange/90 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>
                      </form>
                    </div>
                  </details>
                </article>
              ))
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-brand-dark/10 pt-4">
            <Link
              href={previousPageUrl}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                page > 1
                  ? "bg-brand-dark text-white hover:bg-brand-dark/90"
                  : "pointer-events-none bg-brand-dark/10 text-brand-dark/40"
              }`}
            >
              Pagina anterior
            </Link>
            <span className="text-xs font-medium uppercase tracking-wide text-brand-dark/60">
              Pagina atual: {page}
            </span>
            <Link
              href={nextPageUrl}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                hasNextPage
                  ? "bg-brand-dark text-white hover:bg-brand-dark/90"
                  : "pointer-events-none bg-brand-dark/10 text-brand-dark/40"
              }`}
            >
              Proxima pagina
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
