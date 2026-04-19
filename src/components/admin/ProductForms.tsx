"use client";

import Image from "next/image";
import { useTransition, useRef, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import CategorySelector from "@/components/admin/CategorySelector";
import { Loader2 } from "lucide-react";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  createFeaturedProductAction,
  listFeaturedSelectableProductsAction,
  reorderFeaturedProductsAction,
  deleteFeaturedProductAction,
  type FeaturedSelectableProduct,
} from "@/app/admin/products/actions";

interface Category {
  id: number;
  category: string;
}

interface Product {
  id: number;
  nome: string;
  id_categoria: number;
  descricao: string;
  image_url: string;
}

interface CreateProductFormProps {
  categories: Category[];
}

export function CreateProductForm({ categories }: CreateProductFormProps) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await createProductAction(formData);
        if (result.success) {
          addToast(result.message, "success");
          formRef.current?.reset();
        } else {
          addToast(result.message, "error");
        }
      } catch {
        addToast("Erro inesperado ao criar produto", "error");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-5 border-t border-brand-dark/5 pt-6">
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

      <div className="space-y-2 text-brand-dark transition-colors">
        <label htmlFor="id_categoria" className="text-sm font-bold uppercase tracking-wide">Categoria</label>
        <CategorySelector initialCategories={categories} />
        <p className="text-xs text-brand-dark/50">
          Se não encontrar uma categoria, clique no botão + para criar uma nova.
        </p>
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

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-4 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] transition-all hover:translate-y-[-2px] hover:bg-brand-red/90 hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] focus:outline-none focus:ring-4 focus:ring-brand-red/20 disabled:pointer-events-none disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Registrando...
          </>
        ) : (
          "Publicar Novo Item"
        )}
      </button>
    </form>
  );
}

interface UpdateProductFormProps {
  product: Product;
  categories: Category[];
}

export function UpdateProductForm({ product, categories }: UpdateProductFormProps) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await updateProductAction(formData);
        if (result.success) {
          addToast(result.message, "success");
        } else {
          addToast(result.message, "error");
        }
      } catch {
        addToast("Erro inesperado ao atualizar produto", "error");
      }
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-6">
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
          <select
            name="id_categoria"
            defaultValue={String(product.id_categoria)}
            required
            className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/30 px-4 py-3 text-sm font-semibold text-brand-dark outline-none transition-all hover:border-brand-dark/30 focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)]"
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category}
              </option>
            ))}
          </select>
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
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:translate-y-[-2px] hover:bg-brand-dark/90 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-dark/20 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gravando...
            </>
          ) : (
            "Salvar Alterações Desse Item"
          )}
        </button>
      </div>
    </form>
  );
}

interface DeleteProductButtonProps {
  productId: number;
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleDelete(formData: FormData) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    startTransition(async () => {
      try {
        const result = await deleteProductAction(formData);
        if (result.success) {
          addToast(result.message, "success");
        } else {
          addToast(result.message, "error");
        }
      } catch {
        addToast("Erro inesperado ao excluir produto", "error");
      }
    });
  }

  return (
    <form action={handleDelete} className="w-full sm:w-auto">
      <input type="hidden" name="id" value={productId} />
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-600/20 disabled:pointer-events-none disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Deletando...
          </>
        ) : (
          "Deletar Item"
        )}
      </button>
    </form>
  );
}

interface CreateFeaturedProductFormProps {
  featuredProductIds: number[];
}

const MAX_FEATURED_PRODUCTS = 10;
const FEATURED_SELECTOR_PAGE_SIZE = 15;

export function CreateFeaturedProductForm({
  featuredProductIds,
}: CreateFeaturedProductFormProps) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<FeaturedSelectableProduct[]>([]);
  const isLimitReached = featuredProductIds.length >= MAX_FEATURED_PRODUCTS;

  useEffect(() => {
    if (isLimitReached) {
      setAvailableProducts([]);
      setHasNextPage(false);
      setOptionsError(null);
      return;
    }

    let cancelled = false;

    async function loadProducts() {
      setIsLoadingOptions(true);

      try {
        const result = await listFeaturedSelectableProductsAction({
          page: currentPage,
          search: searchTerm,
          excludedProductIds: featuredProductIds,
        });

        if (cancelled) {
          return;
        }

        if (!result.success) {
          setAvailableProducts([]);
          setHasNextPage(false);
          setSelectedProductId("");
          setOptionsError(result.message ?? "Não foi possível carregar produtos.");
          return;
        }

        const products = result.products ?? [];
        const nextPage = result.hasNextPage ?? false;

        setAvailableProducts(products);
        setHasNextPage(nextPage);
        setOptionsError(null);
        setSelectedProductId((current) =>
          products.some((product) => String(product.id) === current) ? current : ""
        );
      } catch {
        if (!cancelled) {
          setAvailableProducts([]);
          setHasNextPage(false);
          setSelectedProductId("");
          setOptionsError("Erro inesperado ao carregar produtos.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [currentPage, featuredProductIds, isLimitReached, searchTerm]);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await createFeaturedProductAction(formData);
        if (result.success) {
          addToast(result.message, "success");
          formRef.current?.reset();
          setSelectedProductId("");
          setCurrentPage(1);
        } else {
          addToast(result.message, "error");
        }
      } catch {
        addToast("Erro inesperado ao adicionar destaque", "error");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-5 border-t border-brand-dark/5 pt-6">
      <div className="space-y-1.5 focus-within:text-brand-red text-brand-dark transition-colors">
        <label htmlFor="product_search" className="text-sm font-bold uppercase tracking-wide">
          Buscar produto
        </label>
        <input
          id="product_search"
          type="text"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          disabled={isPending || isLimitReached}
          placeholder="Digite parte do nome"
          className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/20 px-4 py-3 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-dark/30 hover:border-brand-dark/30 focus:border-brand-red focus:bg-white focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)] disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="space-y-1.5 focus-within:text-brand-red text-brand-dark transition-colors">
        <label htmlFor="product_id_selector" className="text-sm font-bold uppercase tracking-wide">
          Produto
        </label>
        <input type="hidden" name="product_id" value={selectedProductId} />
        <select
          id="product_id_selector"
          required
          value={selectedProductId}
          onChange={(event) => setSelectedProductId(event.target.value)}
          disabled={isLoadingOptions || availableProducts.length === 0 || isPending || isLimitReached}
          className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/20 px-4 py-3 text-sm text-brand-dark outline-none transition-all hover:border-brand-dark/30 focus:border-brand-red focus:bg-white focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="" disabled>
            {isLimitReached
              ? "Limite de 10 destaques atingido"
              : isLoadingOptions
                ? "Carregando produtos..."
                : optionsError
                  ? "Erro ao carregar lista de produtos"
              : availableProducts.length === 0
                ? "Nenhum produto encontrado"
                : "Selecione um produto"}
          </option>
          {availableProducts.map((product) => (
            <option key={product.id} value={product.id}>
              #{product.id} - {product.nome}
            </option>
          ))}
        </select>
      </div>

      {optionsError ? (
        <p className="text-xs font-semibold text-brand-red">{optionsError}</p>
      ) : null}

      {!isLimitReached ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-dark/10 bg-brand-light/20 px-3 py-2 text-xs font-semibold text-brand-dark/70">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={isPending || isLoadingOptions || currentPage <= 1}
            className="rounded-lg border border-brand-dark/10 bg-white px-3 py-1.5 transition hover:bg-brand-light disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {currentPage} - {FEATURED_SELECTOR_PAGE_SIZE} itens
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={isPending || isLoadingOptions || !hasNextPage}
            className="rounded-lg border border-brand-dark/10 bg-white px-3 py-1.5 transition hover:bg-brand-light disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      ) : null}

      <div className="rounded-xl border border-brand-dark/10 bg-brand-light/40 px-4 py-3 text-xs font-medium text-brand-dark/70">
        Novos destaques entram automaticamente na primeira posição do carrossel.
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedProductId || isLimitReached}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-4 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] transition-all hover:translate-y-[-2px] hover:bg-brand-red/90 hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] focus:outline-none focus:ring-4 focus:ring-brand-red/20 disabled:pointer-events-none disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Adicionando...
          </>
        ) : (
          isLimitReached ? "Limite de 10 atingido" : "Adicionar aos Destaques"
        )}
      </button>

      {isLimitReached ? (
        <p className="text-xs font-semibold text-brand-red">
          Você atingiu o limite de 10 produtos em destaque. Remova um item para incluir outro.
        </p>
      ) : null}
    </form>
  );
}

interface FeaturedProductsReorderFormItem {
  featuredId: number;
  productId: number;
  productName: string;
  categoryName: string;
  imageUrl: string | null;
  isMissing: boolean;
}

interface FeaturedProductsReorderFormProps {
  items: FeaturedProductsReorderFormItem[];
}

export function FeaturedProductsReorderForm({ items }: FeaturedProductsReorderFormProps) {
  const { addToast } = useToast();
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const originalOrderKey = items.map((item) => item.featuredId).join(",");
  const currentOrderKey = orderedItems.map((item) => item.featuredId).join(",");
  const hasChanges = originalOrderKey !== currentOrderKey;

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  function moveItemToTarget(draggedFeaturedId: number, targetFeaturedId: number) {
    if (draggedFeaturedId === targetFeaturedId) {
      return;
    }

    setOrderedItems((current) => {
      const draggedIndex = current.findIndex((item) => item.featuredId === draggedFeaturedId);
      const targetIndex = current.findIndex((item) => item.featuredId === targetFeaturedId);
      if (draggedIndex < 0 || targetIndex < 0) {
        return current;
      }

      const updated = [...current];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedItem);
      return updated;
    });
  }

  async function handleSaveOrder() {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set(
          "ordered_ids",
          JSON.stringify(orderedItems.map((item) => item.featuredId))
        );
        const result = await reorderFeaturedProductsAction(formData);
        if (result.success) {
          addToast(result.message, "success");
        } else {
          addToast(result.message, "error");
        }
      } catch {
        addToast("Erro inesperado ao atualizar ordem", "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-dark/10 bg-brand-light/35 px-4 py-3 text-xs text-brand-dark/70">
        Arraste e solte para reordenar os produtos. O primeiro item aparece primeiro no carrossel.
      </div>

      <ul className="space-y-3">
        {orderedItems.map((item, index) => (
          <li
            key={item.featuredId}
            draggable
            onDragStart={() => setDraggedId(item.featuredId)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedId !== null) {
                moveItemToTarget(draggedId, item.featuredId);
                setDraggedId(null);
              }
            }}
            onDragEnd={() => setDraggedId(null)}
            className="rounded-2xl bg-brand-light/30 p-4"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xs font-black text-brand-dark/60">
                  {index + 1}
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-dark/10 bg-white text-brand-dark/40">
                  <span className="text-base leading-none">::</span>
                </div>
                {item.imageUrl ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-brand-dark/20 bg-white text-[10px] font-bold uppercase text-brand-dark/40">
                    Sem imagem
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-brand-dark">
                    #{item.productId} - {item.productName}
                  </p>
                  <p className="truncate text-xs font-medium text-brand-dark/55">
                    {item.categoryName}
                  </p>
                  {item.isMissing ? (
                    <p className="mt-1 text-xs font-semibold text-brand-red">
                      Produto removido do catálogo.
                    </p>
                  ) : null}
                </div>
              </div>

              <DeleteFeaturedProductButton featuredId={item.featuredId} />
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleSaveOrder}
        disabled={isPending || !hasChanges}
        className="w-full rounded-xl bg-brand-dark px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark/90 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : hasChanges ? "Salvar nova ordem" : "Ordem atual salva"}
      </button>
    </div>
  );
}

interface DeleteFeaturedProductButtonProps {
  featuredId: number;
}

export function DeleteFeaturedProductButton({
  featuredId,
}: DeleteFeaturedProductButtonProps) {
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleDelete(formData: FormData) {
    if (!confirm("Remover este produto dos destaques?")) return;

    startTransition(async () => {
      try {
        const result = await deleteFeaturedProductAction(formData);
        if (result.success) {
          addToast(result.message, "success");
        } else {
          addToast(result.message, "error");
        }
      } catch {
        addToast("Erro inesperado ao remover destaque", "error");
      }
    });
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={featuredId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-60"
      >
        {isPending ? "..." : "Remover"}
      </button>
    </form>
  );
}
