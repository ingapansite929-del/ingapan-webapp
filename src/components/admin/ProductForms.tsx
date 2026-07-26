"use client";

import { ArrowDown, ArrowUp, GripVertical, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  createFeaturedProductAction,
  deleteFeaturedProductAction,
  listFeaturedSelectableProductsAction,
  reorderFeaturedProductsAction,
  type FeaturedSelectableProduct,
} from "@/app/admin/products/actions";
import ProductImage from "@/components/products/ProductImage";
import { useToast } from "@/components/Toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const MAX_FEATURED_PRODUCTS = 10;
const FEATURED_SELECTOR_PAGE_SIZE = 15;

export function CreateFeaturedProductForm({
  featuredProductIds,
}: {
  featuredProductIds: number[];
}) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<
    FeaturedSelectableProduct[]
  >([]);
  const isLimitReached = featuredProductIds.length >= MAX_FEATURED_PRODUCTS;

  useEffect(() => {
    if (isLimitReached) return;
    let cancelled = false;

    async function loadProducts() {
      setIsLoadingOptions(true);
      try {
        const result = await listFeaturedSelectableProductsAction({
          page: currentPage,
          search: searchTerm,
          excludedProductIds: featuredProductIds,
        });
        if (cancelled) return;
        if (!result.success) {
          setAvailableProducts([]);
          setHasNextPage(false);
          setSelectedProductId("");
          setOptionsError(result.message ?? "Não foi possível carregar produtos.");
          return;
        }
        const products = result.products ?? [];
        setAvailableProducts(products);
        setHasNextPage(result.hasNextPage ?? false);
        setOptionsError(null);
        setSelectedProductId((current) =>
          products.some((product) => String(product.id) === current)
            ? current
            : ""
        );
      } catch {
        if (!cancelled) {
          setAvailableProducts([]);
          setHasNextPage(false);
          setSelectedProductId("");
          setOptionsError("Erro inesperado ao carregar produtos.");
        }
      } finally {
        if (!cancelled) setIsLoadingOptions(false);
      }
    }

    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, [currentPage, featuredProductIds, isLimitReached, searchTerm]);

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createFeaturedProductAction(formData);
      addToast(result.message, result.success ? "success" : "error");
      if (result.success) {
        formRef.current?.reset();
        setSelectedProductId("");
        setCurrentPage(1);
      }
    });
  };

  return (
    <form ref={formRef} action={submit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="featured-search" className="text-sm font-medium">
          Buscar produto
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="featured-search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            disabled={isPending || isLimitReached}
            placeholder="Digite parte do nome"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="featured-product" className="text-sm font-medium">
          Produto
        </label>
        <select
          id="featured-product"
          name="product_id"
          required
          value={selectedProductId}
          onChange={(event) => setSelectedProductId(event.target.value)}
          disabled={
            isLoadingOptions ||
            !availableProducts.length ||
            isPending ||
            isLimitReached
          }
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
        >
          <option value="" disabled>
            {isLimitReached
              ? "Limite de 10 atingido"
              : isLoadingOptions
                ? "Carregando..."
                : "Selecione um produto"}
          </option>
          {availableProducts.map((product) => (
            <option key={product.id} value={product.id}>
              #{product.id} — {product.nome}
            </option>
          ))}
        </select>
        {optionsError ? (
          <p className="text-xs font-medium text-destructive">{optionsError}</p>
        ) : null}
      </div>

      {!isLimitReached ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 p-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={isPending || isLoadingOptions || currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {currentPage} · {FEATURED_SELECTOR_PAGE_SIZE} itens
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={isPending || isLoadingOptions || !hasNextPage}
          >
            Próxima
          </Button>
        </div>
      ) : null}

      <Button
        type="submit"
        variant="secondary"
        className="w-full"
        disabled={isPending || !selectedProductId || isLimitReached}
      >
        {isPending ? <Spinner /> : null}
        {isPending
          ? "Adicionando..."
          : isLimitReached
            ? "Limite de 10 atingido"
            : "Adicionar aos destaques"}
      </Button>
    </form>
  );
}

interface FeaturedItem {
  featuredId: number;
  productId: number;
  productName: string;
  categoryName: string;
  imageUrl: string | null;
  isMissing: boolean;
}

export function FeaturedProductsReorderForm({
  items,
}: {
  items: FeaturedItem[];
}) {
  const { addToast } = useToast();
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const originalOrder = items.map((item) => item.featuredId).join(",");
  const currentOrder = orderedItems.map((item) => item.featuredId).join(",");

  const moveToIndex = (from: number, to: number) => {
    if (from === to || to < 0 || to >= orderedItems.length) return;
    setOrderedItems((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const moveById = (sourceId: number, targetId: number) => {
    const source = orderedItems.findIndex((item) => item.featuredId === sourceId);
    const target = orderedItems.findIndex((item) => item.featuredId === targetId);
    moveToIndex(source, target);
  };

  const saveOrder = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set(
        "ordered_ids",
        JSON.stringify(orderedItems.map((item) => item.featuredId))
      );
      const result = await reorderFeaturedProductsAction(formData);
      addToast(result.message, result.success ? "success" : "error");
    });
  };

  return (
    <div className="space-y-4">
      <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
        Use os botões para ordenar por teclado ou arraste no desktop. O primeiro
        produto aparece primeiro no carrossel.
      </p>
      <ul className="space-y-2">
        {orderedItems.map((item, index) => (
          <li
            key={item.featuredId}
            draggable
            onDragStart={() => setDraggedId(item.featuredId)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedId !== null) moveById(draggedId, item.featuredId);
              setDraggedId(null);
            }}
            onDragEnd={() => setDraggedId(null)}
            className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold">
                {index + 1}
              </span>
              <GripVertical className="hidden size-4 text-muted-foreground sm:block" />
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  #{item.productId} · {item.productName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.categoryName}
                </p>
                {item.isMissing ? (
                  <p className="text-xs font-medium text-destructive">
                    Produto removido do catálogo
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={index === 0}
                onClick={() => moveToIndex(index, index - 1)}
                aria-label={`Mover ${item.productName} para cima`}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={index === orderedItems.length - 1}
                onClick={() => moveToIndex(index, index + 1)}
                aria-label={`Mover ${item.productName} para baixo`}
              >
                <ArrowDown />
              </Button>
              <DeleteFeaturedProductButton
                featuredId={item.featuredId}
                productName={item.productName}
              />
            </div>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        onClick={saveOrder}
        disabled={isPending || originalOrder === currentOrder}
        className="min-w-44"
      >
        {isPending ? <Spinner /> : null}
        {isPending
          ? "Salvando..."
          : originalOrder === currentOrder
            ? "Ordem atual salva"
            : "Salvar nova ordem"}
      </Button>
    </div>
  );
}

function DeleteFeaturedProductButton({
  featuredId,
  productName,
}: {
  featuredId: number;
  productName: string;
}) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const remove = () => {
    const formData = new FormData();
    formData.set("id", String(featuredId));
    startTransition(async () => {
      const result = await deleteFeaturedProductAction(formData);
      addToast(result.message, result.success ? "success" : "error");
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          aria-label={`Remover ${productName} dos destaques`}
        >
          {isPending ? <Spinner /> : <Trash2 className="text-destructive" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover dos destaques?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{productName}</strong> deixará de aparecer na página
            inicial, mas continuará disponível no catálogo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              remove();
            }}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? <Spinner /> : <Trash2 />}
            {isPending ? "Removendo..." : "Remover destaque"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
