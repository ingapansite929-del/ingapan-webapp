"use client";

import Link from "next/link";
import { ArrowRight, PackageSearch, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import ProductImage from "@/components/products/ProductImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  buildProductsUrl,
  getPaginationItems,
  type ProductCatalogFilters,
} from "@/features/products/catalog";
import {
  getProductCategory,
  getProductSubcategory,
  type ProductRecord,
} from "@/features/products/types";
import { useCart } from "@/lib/CartContext";

interface ProductsGridProps {
  products: ProductRecord[];
  currentPage: number;
  pageCount: number;
  total: number;
  pageSize: number;
  filters: ProductCatalogFilters;
}

export default function ProductsGrid({
  products,
  currentPage,
  pageCount,
  total,
  pageSize,
  filters,

  if (products.length === 0) {
    return (
      <Empty className="min-h-96 border-2 bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageSearch />
          </EmptyMedia>
          <EmptyTitle>Nenhum produto encontrado</EmptyTitle>
          <EmptyDescription>
            Não encontramos produtos com essa combinação. Limpe os filtros e
            tente novamente.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="secondary">
            <Link href="/produtos">Limpar filtros</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const firstResult = (currentPage - 1) * pageSize + 1;
  const lastResult = Math.min(currentPage * pageSize, total);
  const paginationItems = getPaginationItems(currentPage, pageCount);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => {
          const category = getProductCategory(product);
          const subcategory = getProductSubcategory(product);

          return (
            <motion.article
              key={product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-[var(--motion-normal)] hover:-translate-y-1 hover:border-brand-yellow hover:shadow-[var(--shadow-raised)]"
            >
              <Link
                href={`/produtos/${product.id}`}
                scroll
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                aria-label={`Ver detalhes de ${product.nome}`}
              >
                <div
                  data-product-image
                  className="relative aspect-[4/3] overflow-hidden bg-muted"
                >
                  <ProductImage
                    src={product.image_url}
                    alt={product.nome}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    loading={index < 4 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </div>
                <div className="space-y-3 p-5 pb-3">
                  <div className="flex min-h-6 flex-wrap gap-1.5">
                    {category ? (
                      <Badge variant="secondary">{category.category}</Badge>
                    ) : null}
                    {subcategory ? (
                      <Badge variant="outline">
                        {subcategory.subcategoria}
                      </Badge>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-brand-red">
                      {product.nome}
                    </h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Cód. #{product.id}
                    </p>
                  </div>
                  {product.descricao ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {product.descricao}
                    </p>
                  ) : null}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Ver detalhes <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
              <div className="mt-auto p-5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={(event) => {
                    const card = event.currentTarget.closest("article");
                    addItem(product, {
                      sourceElement:
                        card?.querySelector("[data-product-image]") ??
                        event.currentTarget,
                    });
                  }}
                >
                  <ShoppingCart />
                  Adicionar ao orçamento
                </Button>
              </div>
            </motion.article>
          );
        })}
            <PaginationItem>
              <PaginationPrevious
                href={buildProductsUrl(filters, Math.max(1, currentPage - 1))}
                aria-label="Ir para a página anterior"
                className={
                  currentPage === 1 ? "pointer-events-none opacity-40" : ""
                }
              />
            </PaginationItem>
            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href={buildProductsUrl(filters, item)}
                    isActive={item === currentPage}
                    aria-label={`Ir para a página ${item}`}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href={buildProductsUrl(
                  filters,
                  Math.min(pageCount, currentPage + 1)
                )}
                aria-label="Ir para a próxima página"
                className={
                  currentPage === pageCount
                    ? "pointer-events-none opacity-40"
                    : ""
                }
              />
            </PaginationItem>
    </div>
  );
}
