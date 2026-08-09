"use client";

import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  deleteFeaturedProductAction,
  reorderFeaturedProductsAction,
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
import { Spinner } from "@/components/ui/spinner";

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
