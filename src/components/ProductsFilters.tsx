"use client";

import { useRouter } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useTransition } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}

interface FilterControlsProps {
  prefix: string;
  categories: ProductCategoryOption[];
  subcategories: ProductSubcategoryOption[];
  draft: ProductCatalogFilters;
  setDraft: React.Dispatch<React.SetStateAction<ProductCatalogFilters>>;
}

function FilterControls({
  prefix,
  categories,
  subcategories,
  draft,
  setDraft,
}: FilterControlsProps) {
  return (
    <div className="grid min-w-0 flex-1 gap-4 lg:grid-cols-[minmax(240px,1.4fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)]">
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
        <label className="text-sm font-medium">Categoria</label>
        <Select
          value={draft.categoria || "all"}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              categoria: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger className="w-full" aria-label="Categoria">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Subcategoria</label>
        <Select
          value={draft.subcategoria || "all"}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              subcategoria: value === "all" ? "" : value,
            }))
          }
        >
          <SelectTrigger className="w-full" aria-label="Subcategoria">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as subcategorias</SelectItem>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                {subcategory.subcategoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ordenar por</label>
        <Select
          value={draft.ordem}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              ordem: value as ProductOrder,
            }))
          }
        >
          <SelectTrigger className="w-full" aria-label="Ordenar produtos">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_ORDER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function ProductsFilters({
  categories,
  subcategories,
  filters,
  total,
}: ProductsFiltersProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(filters);
  const [mobileSearch, setMobileSearch] = useState(filters.nome);
  const [isPending, startTransition] = useTransition();
  const hasActiveFilters = Boolean(
    filters.nome || filters.categoria || filters.subcategoria
  );

  const navigate = (nextFilters: ProductCatalogFilters) => {
    startTransition(() => router.push(buildProductsUrl(nextFilters), { scroll: false }));
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
          className="hidden items-end gap-3 lg:flex"
        >
          <FilterControls
            prefix="desktop"
            categories={categories}
            subcategories={subcategories}
            draft={draft}
            setDraft={setDraft}
          />
          <Button
            type="submit"
            variant="secondary"
            className="min-w-28"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <Filter />}
            Aplicar
          </Button>
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
