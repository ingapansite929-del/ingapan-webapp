"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Package, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";

interface Product {
  id: number;
  nome: string;
  id_categoria: number;
  descricao: string;
  image_url: string;
  product_categoria?: { id: number; category: string }[] | { id: number; category: string } | null;
}

interface ProductsGridProps {
  products: Product[];
  currentPage: number;
  hasNextPage: boolean;
  currentNome: string;
  currentCategoria: string;
}

function buildUrl(page: number, nome: string, categoria: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (nome) params.set("nome", nome);
  if (categoria) params.set("categoria", categoria);
  return `/produtos${params.toString() ? `?${params.toString()}` : ""}`;
}

export default function ProductsGrid({
  products,
  currentPage,
  hasNextPage,
  currentNome,
  currentCategoria,
}: ProductsGridProps) {
  const { addItem } = useCart();
  
  const previousPageUrl = buildUrl(
    Math.max(currentPage - 1, 1),
    currentNome,
    currentCategoria
  );
  const nextPageUrl = buildUrl(
    currentPage + 1,
    currentNome,
    currentCategoria
  );

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[1.55rem] border-2 border-dashed border-brand-dark/10 bg-white p-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-light shadow-inner">
          <Package className="h-10 w-10 text-brand-dark/30" />
        </div>
        <h3 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.01em] text-brand-dark">
          Nenhum produto encontrado
        </h3>
        <p className="mt-2 max-w-[60ch] leading-relaxed text-brand-dark/60">
          Não encontramos produtos com os filtros selecionados. Tente ajustar sua busca ou limpar os filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-[1.35rem] border border-brand-dark/10 bg-white shadow-[0_22px_38px_-32px_rgba(34,34,34,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/50 hover:shadow-[0_28px_50px_-32px_rgba(34,34,34,0.85)]"
          >
            <Link href={`/produtos/${product.id}`} className="block">
              {/* Imagem do Produto */}
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-light">
                <Image
                  src={product.image_url}
                  alt={product.nome}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                
                {/* Badge da Categoria */}
                {product.product_categoria && (
                  <div className="absolute right-3 top-3">
                  <span className="inline-block rounded-lg border border-brand-yellow/30 bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-dark shadow-lg backdrop-blur-sm">
                      {Array.isArray(product.product_categoria)
                        ? product.product_categoria[0]?.category
                        : product.product_categoria.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Conteúdo do Card */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 font-[var(--font-heading)] text-lg font-bold tracking-[-0.01em] text-brand-dark transition-colors group-hover:text-brand-orange">
                  {product.nome}
                </h3>
                
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-dark/60 line-clamp-3">
                  {product.descricao}
                </p>
              </div>
            </Link>

            {/* Ação */}
            <div className="mt-auto flex items-center justify-between border-t border-brand-dark/5 p-5 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/40">
                Cód. #{product.id}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/produtos/${product.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-dark/15 px-3.5 py-2 text-sm font-semibold text-brand-dark transition-all hover:border-brand-red/30 hover:text-brand-red active:translate-y-px"
                >
                  <Eye className="h-4 w-4" />
                  Detalhes
                </Link>
                <button
                  onClick={() => addItem(product)}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-yellow px-4 py-2 text-sm font-bold text-brand-dark transition-all hover:bg-brand-yellow/90 hover:shadow-[0_16px_28px_-20px_rgba(249,207,0,0.8)] active:scale-95"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Barra decorativa inferior */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-yellow via-brand-orange to-brand-red"></div>
          </article>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between rounded-[1.5rem] border border-brand-dark/10 bg-white p-6 shadow-[0_20px_38px_-34px_rgba(34,34,34,0.7)]">
        <Link
          href={previousPageUrl}
          className={`group flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all ${
            currentPage > 1
              ? "bg-brand-dark text-white hover:bg-brand-dark/90 hover:shadow-[0_18px_30px_-22px_rgba(34,34,34,0.9)]"
              : "pointer-events-none bg-brand-light text-brand-dark/30"
          }`}
        >
          <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="hidden sm:inline">Anterior</span>
        </Link>

        <div className="flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/50">
            Página
          </span>
          <span className="mt-1 font-[var(--font-heading)] text-2xl font-bold text-brand-dark">
            {currentPage}
          </span>
        </div>

        <Link
          href={nextPageUrl}
          className={`group flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all ${
            hasNextPage
              ? "bg-brand-dark text-white hover:bg-brand-dark/90 hover:shadow-[0_18px_30px_-22px_rgba(34,34,34,0.9)]"
              : "pointer-events-none bg-brand-light text-brand-dark/30"
          }`}
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Info da Paginação */}
      <p className="text-center text-sm text-brand-dark/60">
        Exibindo {products.length} produto{products.length !== 1 ? "s" : ""} por página
      </p>
    </div>
  );
}
