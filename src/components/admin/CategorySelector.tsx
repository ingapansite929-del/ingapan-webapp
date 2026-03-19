"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createCategoryJsonAction } from "@/app/admin/products/actions";
import { Plus, X, Loader2 } from "lucide-react";

interface Category {
  id: number;
  category: string;
}

interface CategorySelectorProps {
  initialCategories: Category[];
}

export default function CategorySelector({ initialCategories }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await createCategoryJsonAction(newCategoryName);
      if (result.success && result.category) {
        setCategories([...categories, result.category]);
        setSelectedCategory(String(result.category.id));
        setNewCategoryName("");
        setIsModalOpen(false);
      } else {
        setError(result.error || "Erro ao criar categoria");
      }
    } catch (e) {
      console.error(e);
      setError("Erro inesperado ao criar categoria");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex gap-2 relative">
      <select
        id="id_categoria"
        name="id_categoria"
        required
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        disabled={categories.length === 0}
        className="w-full rounded-xl border-2 border-brand-dark/10 bg-brand-light/20 px-4 py-3 text-sm text-brand-dark outline-none transition-all hover:border-brand-dark/30 focus:border-brand-red focus:bg-white focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" disabled>
          {categories.length === 0
            ? "Crie uma categoria para continuar"
            : "Selecione uma categoria"}
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.category}
          </option>
        ))}
      </select>
      
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center rounded-xl bg-brand-dark px-3 py-3 text-white transition-all hover:bg-brand-dark/90 focus:outline-none focus:ring-4 focus:ring-brand-dark/20"
        title="Nova Categoria"
      >
        <Plus className="h-5 w-5" />
      </button>

      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-dark">Nova Categoria</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 hover:bg-brand-light/50 text-brand-dark/60 hover:text-brand-dark transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="new-category" className="text-sm font-medium text-brand-dark">Nome da Categoria</label>
                <input
                  id="new-category"
                  type="text"
                  minLength={2}
                  maxLength={80}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Pães Artesanais"
                  className="w-full rounded-xl border-2 border-brand-dark/10 bg-white px-4 py-3 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-dark/30 hover:border-brand-dark/30 focus:border-brand-red focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                />
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isLoading || !newCategoryName.trim()}
                  className="flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-dark/90 focus:outline-none focus:ring-4 focus:ring-brand-dark/20 disabled:pointer-events-none disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Categoria"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
