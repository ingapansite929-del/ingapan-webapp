"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import ProductsFilters from "@/components/ProductsFilters";
import ProductsGrid from "@/components/ProductsGrid";
import type {
  ProductCategoryOption,
  ProductCatalogFilters,
  ProductSubcategoryOption,
} from "@/features/products/catalog";
import { createCatalogNavigationLock } from "@/features/products/catalog";
import type { ProductRecord } from "@/features/products/types";

interface ProductsCatalogClientProps {
  products: ProductRecord[];
  categories: ProductCategoryOption[];
  subcategories: ProductSubcategoryOption[];
  filters: ProductCatalogFilters;
  currentPage: number;
  pageCount: number;
  total: number;
  pageSize: number;
}

export default function ProductsCatalogClient({
  products,
  categories,
  subcategories,
  filters,
  currentPage,
  pageCount,
  total,
  pageSize,
}: ProductsCatalogClientProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const navigationLockRef = useRef(createCatalogNavigationLock());
  const catalogRef = useRef<HTMLDivElement>(null);

  const navigate = (href: string, scrollToCatalog = false) => {
    if (!navigationLockRef.current.tryStart(href)) return false;

    if (scrollToCatalog) {
      catalogRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    startTransition(() => {
      router.push(href, { scroll: false });
    });
    return true;
  };

  useEffect(() => {
    if (!isPending) navigationLockRef.current.release();
  }, [isPending]);

  return (
    <div ref={catalogRef} data-catalog-start className="scroll-mt-24">
      <ProductsFilters
        key={`${filters.nome}-${filters.categoria}-${filters.subcategoria}-${filters.ordem}`}
        categories={categories}
        subcategories={subcategories}
        filters={filters}
        total={total}
        isPending={isPending}
        onNavigate={(href) => navigate(href)}
      />
      <ProductsGrid
        products={products}
        currentPage={currentPage}
        pageCount={pageCount}
        total={total}
        pageSize={pageSize}
        filters={filters}
        isPending={isPending}
        onNavigate={(href) => navigate(href, true)}
      />
    </div>
  );
}
