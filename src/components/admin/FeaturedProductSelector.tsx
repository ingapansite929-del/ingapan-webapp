"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { Filter, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type UIEvent,
} from "react";
import {
  createFeaturedProductAction,
  listFeaturedSelectableProductsAction,
} from "@/app/admin/products/actions";
import ProductImage from "@/components/products/ProductImage";
import { useToast } from "@/components/Toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type {
  ProductCategoryOption,
  ProductSubcategoryOption,
} from "@/features/products/catalog";
import type { FeaturedSelectableProduct } from "@/features/products/featured-selector";

const MAX_FEATURED_PRODUCTS = 10;
const ALL_FILTERS_VALUE = "all";
const FEATURED_SELECTOR_QUERY_KEY = [
  "admin",
  "featured-selector",
  "scroll-intent-v2",
] as const;

interface FeaturedSelectorPage {
  products: FeaturedSelectableProduct[];
  page: number;
  hasNextPage: boolean;
}

interface FeaturedProductSelectorProps {
  featuredProductIds: number[];
  categories: ProductCategoryOption[];
  subcategories: ProductSubcategoryOption[];
}

function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

function SelectorRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-2">
      <Skeleton className="size-12 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <Skeleton className="size-8 shrink-0 rounded-md" />
    </div>
  );
}

export default function FeaturedProductSelector({
  featuredProductIds,
  categories,
  subcategories,
}: FeaturedProductSelectorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const nextPagePendingRef = useRef(false);
  const hasScrollIntentRef = useRef(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState(ALL_FILTERS_VALUE);
  const [draftSubcategoryId, setDraftSubcategoryId] =
    useState(ALL_FILTERS_VALUE);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const isLimitReached = featuredProductIds.length >= MAX_FEATURED_PRODUCTS;
  const excludedIdsKey = useMemo(
    () => [...featuredProductIds].sort((a, b) => a - b).join(","),
    [featuredProductIds]
  );

  const query = useInfiniteQuery({
    queryKey: [
      ...FEATURED_SELECTOR_QUERY_KEY,
      debouncedSearch,
      categoryId,
      subcategoryId,
      excludedIdsKey,
    ],
    initialPageParam: 1,
    enabled: !isLimitReached,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryFn: async ({ pageParam }): Promise<FeaturedSelectorPage> => {
      const result = await listFeaturedSelectableProductsAction({
        page: pageParam,
        search: debouncedSearch,
        categoryId,
        subcategoryId,
        excludedProductIds: featuredProductIds,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        products: result.products ?? [],
        page: result.page ?? pageParam,
        hasNextPage: result.hasNextPage ?? false,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  const products = useMemo(() => {
    const byId = new Map<number, FeaturedSelectableProduct>();
    for (const page of query.data?.pages ?? []) {
      for (const product of page.products) {
        byId.set(product.id, product);
      }
    }
    return [...byId.values()];
  }, [query.data]);

  const addMutation = useMutation({
    mutationFn: async (product: FeaturedSelectableProduct) => {
      const formData = new FormData();
      formData.set("product_id", String(product.id));
      const result = await createFeaturedProductAction(formData);
      if (!result.success) throw new Error(result.message);
      return { productId: product.id, message: result.message };
    },
    onSuccess: ({ productId, message }) => {
      queryClient.setQueriesData<InfiniteData<FeaturedSelectorPage>>(
        { queryKey: FEATURED_SELECTOR_QUERY_KEY },
        (current) => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              products: page.products.filter(
                (product) => product.id !== productId
              ),
            })),
          };
        }
      );
      addToast(message, "success");
      router.refresh();
    },
    onError: (error) => {
      addToast(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o destaque.",
        "error"
      );
    },
  });
  const hasNextPage = query.hasNextPage;
  const isFetchingNextPage = query.isFetchingNextPage;
  const fetchNextPage = query.fetchNextPage;

  const loadNextPage = async () => {
    if (
      nextPagePendingRef.current ||
      isFetchingNextPage ||
      !hasNextPage ||
      isLimitReached
    ) {
      return;
    }

    nextPagePendingRef.current = true;
    try {
      await fetchNextPage({ cancelRefetch: false });
    } finally {
      nextPagePendingRef.current = false;
    }
  };

  const handleResultsScroll = (event: UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const distanceToEnd =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (
      hasScrollIntentRef.current &&
      container.scrollTop > 0 &&
      distanceToEnd <= 120
    ) {
      hasScrollIntentRef.current = false;
      void loadNextPage();
    }
  };

  const handleResultsKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (["ArrowDown", "End", "PageDown", " "].includes(event.key)) {
      hasScrollIntentRef.current = true;
    }
  };

  const handleResultsPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      hasScrollIntentRef.current = true;
    }
  };

  const activeCategory = categories.find((item) => item.id === categoryId);
  const activeSubcategory = subcategories.find(
    (item) => item.id === subcategoryId
  );
  const activeFilterCount =
    Number(Boolean(categoryId)) + Number(Boolean(subcategoryId));
  const mutationProductId = addMutation.variables?.id ?? null;

  const openFilters = (open: boolean) => {
    if (open) {
      setDraftCategoryId(categoryId ? String(categoryId) : ALL_FILTERS_VALUE);
      setDraftSubcategoryId(
        subcategoryId ? String(subcategoryId) : ALL_FILTERS_VALUE
      );
    }
    setFiltersOpen(open);
  };

  const applyFilters = () => {
    setCategoryId(
      draftCategoryId === ALL_FILTERS_VALUE ? null : Number(draftCategoryId)
    );
    setSubcategoryId(
      draftSubcategoryId === ALL_FILTERS_VALUE
        ? null
        : Number(draftSubcategoryId)
    );
    setFiltersOpen(false);
    hasScrollIntentRef.current = false;
    scrollRootRef.current?.scrollTo?.({ top: 0 });
  };

  const clearFilters = () => {
    setDraftCategoryId(ALL_FILTERS_VALUE);
    setDraftSubcategoryId(ALL_FILTERS_VALUE);
    setCategoryId(null);
    setSubcategoryId(null);
    setFiltersOpen(false);
    hasScrollIntentRef.current = false;
    scrollRootRef.current?.scrollTo?.({ top: 0 });
  };

  if (isLimitReached) {
    return (
      <Alert>
        <AlertTitle>Limite de destaques atingido</AlertTitle>
        <AlertDescription>
          Remova um dos 10 produtos da ordem de exibição para adicionar outro.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="featured-search" className="sr-only">
            Buscar produto para destaque
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="featured-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              hasScrollIntentRef.current = false;
              scrollRootRef.current?.scrollTo?.({ top: 0 });
            }}
            disabled={addMutation.isPending}
            placeholder="Buscar produto"
            className="pl-9 pr-9"
          />
          {query.isFetching && !query.isFetchingNextPage ? (
            <Spinner className="absolute right-3 top-1/2 size-4 -translate-y-1/2" />
          ) : null}
        </div>

        <Popover open={filtersOpen} onOpenChange={openFilters}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={activeFilterCount ? "secondary" : "outline"}
              size="icon"
              disabled={addMutation.isPending}
              className="shrink-0"
              aria-label={
                activeFilterCount
                  ? `Filtros de produtos, ${activeFilterCount} ativos`
                  : "Filtrar produtos"
              }
            >
              <Filter />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] space-y-4">
            <div>
              <p className="font-semibold">Filtrar produtos</p>
              <p className="text-xs text-muted-foreground">
                Combine categoria e subcategoria antes de aplicar.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="featured-category">
                Categoria
              </label>
              <Select
                value={draftCategoryId}
                onValueChange={setDraftCategoryId}
              >
                <SelectTrigger id="featured-category" className="w-full">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectItem value={ALL_FILTERS_VALUE}>
                    Todas as categorias
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="featured-subcategory"
              >
                Subcategoria
              </label>
              <Select
                value={draftSubcategoryId}
                onValueChange={setDraftSubcategoryId}
              >
                <SelectTrigger id="featured-subcategory" className="w-full">
                  <SelectValue placeholder="Todas as subcategorias" />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectItem value={ALL_FILTERS_VALUE}>
                    Todas as subcategorias
                  </SelectItem>
                  {subcategories.map((subcategory) => (
                    <SelectItem
                      key={subcategory.id}
                      value={String(subcategory.id)}
                    >
                      {subcategory.subcategoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={clearFilters}>
                Limpar
              </Button>
              <Button type="button" onClick={applyFilters}>
                Aplicar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {activeFilterCount ? (
        <div
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
          aria-label="Filtros ativos"
        >
          <span>
            Filtros: {[activeCategory?.category, activeSubcategory?.subcategoria]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <Button type="button" variant="link" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : null}

      <div
        ref={scrollRootRef}
        onScroll={handleResultsScroll}
        onWheel={() => {
          hasScrollIntentRef.current = true;
        }}
        onTouchStart={() => {
          hasScrollIntentRef.current = true;
        }}
        onKeyDown={handleResultsKeyDown}
        onPointerDown={handleResultsPointerDown}
        style={{ overflowY: "auto", overscrollBehavior: "contain" }}
        className="min-h-0 flex-1 space-y-2 rounded-xl border bg-muted/20 p-2"
        tabIndex={0}
        aria-label="Produtos disponíveis para destaque"
        aria-busy={query.isPending || query.isFetchingNextPage}
        aria-live="polite"
      >
        {query.isPending ? (
          Array.from({ length: 6 }, (_, index) => (
            <SelectorRowSkeleton key={index} />
          ))
        ) : query.isError && products.length === 0 ? (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar os produtos</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>
                {query.error instanceof Error
                  ? query.error.message
                  : "Tente novamente em instantes."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void query.refetch()}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        ) : products.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="font-medium">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground">
              Ajuste a busca ou remova os filtros aplicados.
            </p>
            {activeFilterCount ? (
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {products.map((product) => {
              const isAdding = mutationProductId === product.id;
              return (
                <article
                  key={product.id}
                  className="flex items-center gap-2 rounded-xl border bg-card p-2 shadow-xs"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.nome}
                      fill
                      className="object-cover"
                      fallbackClassName="[&_span]:hidden [&_svg]:size-4"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {product.nome}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="shrink-0"
                    disabled={addMutation.isPending}
                    onClick={() => addMutation.mutate(product)}
                    aria-label={`Adicionar ${product.nome} aos destaques`}
                  >
                    {isAdding ? <Spinner /> : <Plus />}
                  </Button>
                </article>
              );
            })}

            <div
              className="flex min-h-12 items-center justify-center px-3 text-center text-xs text-muted-foreground"
            >
              {query.isFetchingNextPage ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Carregando mais produtos...
                </span>
              ) : query.isError ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadNextPage()}
                >
                  Tentar carregar novamente
                </Button>
              ) : query.hasNextPage ? (
                "Role para carregar mais"
              ) : (
                "Fim da lista"
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
