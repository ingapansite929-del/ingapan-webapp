"use client";

import { useTransition, useRef } from "react";
import { useToast } from "@/components/Toast";
import CategorySelector from "@/components/admin/CategorySelector";
import { Loader2 } from "lucide-react";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction
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
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
