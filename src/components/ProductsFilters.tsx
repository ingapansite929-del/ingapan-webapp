"use client";

import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  buildProductsUrl,
  PRODUCT_ORDER_OPTIONS,
  type ProductCategoryOption,
  type ProductCatalogFilters,
  type ProductOrder,
  type ProductSubcategoryOption,
} from "@/features/products/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";

interface ProductsFiltersProps {
  categories: ProductCategoryOption[];
  subcategories: ProductSubcategoryOption[];
  filters: ProductCatalogFilters;
  total: number;
  isPending: boolean;
  onNavigate: (href: string) => boolean;
}

interface FilterControlsProps {
  prefix: string;
  categories: ProductCategoryOption[];
  subcategories: ProductSubcategoryOption[];
  draft: ProductCatalogFilters;
  setDraft: React.Dispatch<React.SetStateAction<ProductCatalogFilters>>;
  action?: ReactNode;
}

const FILTER_SELECT_CLASS_NAME =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 lg:h-9";

function FilterControls({
  prefix,
  categories,
  subcategories,
  draft,
  setDraft,
  action,
}: FilterControlsProps) {
  return (
    <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="space-y-2">
        <label htmlFor={`${prefix}-nome`} className="text-sm font-medium">
          Buscar por nome
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={`${prefix}-nome`}
            value={draft.nome}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                nome: event.target.value,
              }))
            }
            className="pl-9"
            placeholder="Ex.: chocolate, farinha..."
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`${prefix}-categoria`}
          className="text-sm font-medium"
        >
          Categoria
        </label>
        <select
          id={`${prefix}-categoria`}
          value={draft.categoria}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              categoria: event.target.value,
            }))
          }
          className={FILTER_SELECT_CLASS_NAME}
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`${prefix}-subcategoria`}
          className="text-sm font-medium"
        >
          Subcategoria
        </label>
        <select
          id={`${prefix}-subcategoria`}
          value={draft.subcategoria}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              subcategoria: event.target.value,
            }))
          }
          className={FILTER_SELECT_CLASS_NAME}
        >
          <option value="">Todas as subcategorias</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.subcategoria}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${prefix}-ordem`} className="text-sm font-medium">
          Ordenar por
        </label>
        <select
          id={`${prefix}-ordem`}
          value={draft.ordem}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              ordem: event.target.value as ProductOrder,
            }))
          }
          className={FILTER_SELECT_CLASS_NAME}
        >
          {PRODUCT_ORDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {action ? <div className="flex items-end">{action}</div> : null}
    </div>
  );
}

export default function ProductsFilters({
  categories,
  subcategories,
  filters,
  total,
  isPending,
  onNavigate,
}: ProductsFiltersProps) {
  const [draft, setDraft] = useState(filters);
  const [mobileSearch, setMobileSearch] = useState(filters.nome);
  const hasActiveFilters = Boolean(
    filters.nome || filters.categoria || filters.subcategoria
  );

  const navigate = (nextFilters: ProductCatalogFilters) => {
    onNavigate(buildProductsUrl(nextFilters));
  };

  const applyDraft = (event?: React.FormEvent) => {
    event?.preventDefault();
    navigate({ ...draft, nome: draft.nome.trim() });
  };

  const clearFilters = () => {
    const cleared: ProductCatalogFilters = {
      nome: "",
      categoria: "",
      subcategoria: "",
      ordem: "nome-asc",
    };
    setDraft(cleared);
    setMobileSearch("");
    navigate(cleared);
  };

  const removeFilter = (
    key: "nome" | "categoria" | "subcategoria"
  ) => {
    const next = { ...filters, [key]: "" };
    setDraft(next);
    if (key === "nome") setMobileSearch("");
    navigate(next);
  };

  const selectedCategory = categories.find(
    (category) => category.id === Number(filters.categoria)
  );
  const selectedSubcategory = subcategories.find(
    (subcategory) => subcategory.id === Number(filters.subcategoria)
  );

  return (
    <div className="mb-7 space-y-4">
      <div className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)]">
        <form
          onSubmit={applyDraft}
          className="hidden lg:block"
        >
          <FilterControls
            prefix="desktop"
            categories={categories}
            subcategories={subcategories}
            draft={draft}
            setDraft={setDraft}
            action={
              <Button
                type="submit"
                variant="secondary"
                className="min-w-28"
                disabled={isPending}
              >
                {isPending ? <Spinner /> : <Filter />}
                Aplicar
              </Button>
            }
          />
        </form>

        <div className="flex gap-2 lg:hidden">
          <form
            className="relative min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const next = {
                ...filters,
                nome: String(formData.get("nome") ?? "").trim(),
              };
              setDraft(next);
              navigate(next);
            }}
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              name="nome"
              value={mobileSearch}
              onChange={(event) => setMobileSearch(event.target.value)}
              className="pr-20 pl-9"
              aria-label="Buscar produtos por nome"
              placeholder="Buscar produtos"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              disabled={isPending}
            >
              Buscar
            </Button>
          </form>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir filtros">
                <SlidersHorizontal />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filtrar produtos</SheetTitle>
                <SheetDescription>
                  Combine categoria, subcategoria e ordenação.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={applyDraft} className="space-y-6 px-4">
                <FilterControls
                  prefix="mobile"
                  categories={categories}
                  subcategories={subcategories}
                  draft={draft}
                  setDraft={setDraft}
                />
                <SheetFooter className="px-0">
                  {hasActiveFilters ? (
                    <Button type="button" variant="ghost" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  ) : null}
                  <SheetClose asChild>
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={isPending}
                      className="min-w-32"
                    >
                      {isPending ? <Spinner /> : <Filter />}
                      Ver resultados
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <strong className="text-foreground">{total}</strong>{" "}
          {total === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            {filters.nome ? (
              <Badge variant="secondary" className="gap-1">
                Nome: {filters.nome}
                <button
                  type="button"
                  onClick={() => removeFilter("nome")}
                  aria-label="Remover filtro de nome"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}
            {selectedCategory ? (
              <Badge variant="secondary" className="gap-1">
                {selectedCategory.category}
                <button
                  type="button"
                  onClick={() => removeFilter("categoria")}
                  aria-label="Remover filtro de categoria"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}
            {selectedSubcategory ? (
              <Badge variant="secondary" className="gap-1">
                {selectedSubcategory.subcategoria}
                <button
                  type="button"
                  onClick={() => removeFilter("subcategoria")}
                  aria-label="Remover filtro de subcategoria"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}
            <Button variant="link" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
