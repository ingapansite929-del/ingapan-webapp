"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";

interface ProductCategory {
  id: number;
  category: string;
}

interface ProductsFiltersProps {
  categories: ProductCategory[];
  currentNome: string;
  currentCategoria: string;
}

export default function ProductsFilters({
  categories,
  currentNome,
  currentCategoria,
}: ProductsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(currentNome);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.set("nome", searchTerm.trim());
    }
    
    if (currentCategoria) {
      params.set("categoria", currentCategoria);
    }

    startTransition(() => {
      router.push(`/produtos${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const handleCategoryChange = (categoriaId: string) => {
    const params = new URLSearchParams();
    
    if (currentNome) {
      params.set("nome", currentNome);
    }
    
    if (categoriaId) {
      params.set("categoria", categoriaId);
    }

    startTransition(() => {
      router.push(`/produtos${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push("/produtos");
    });
  };

  const hasActiveFilters = currentNome || currentCategoria;

  return (
    <div className="mb-8 rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-4">
        
        {/* Busca por Nome */}
        <form onSubmit={handleSearch} className="flex-1">
          <label htmlFor="search" className="mb-2 block text-sm font-semibold text-brand-dark">
            Buscar por Nome
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-dark/40" />
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome do produto..."
              className="w-full rounded-xl border border-brand-dark/20 bg-white py-3 pl-12 pr-4 text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20"
            />
          </div>
        </form>

        {/* Filtro por Categoria */}
        <div className="flex-1">
          <label htmlFor="categoria" className="mb-2 block text-sm font-semibold text-brand-dark">
            Filtrar por Categoria
          </label>
          <select
            id="categoria"
            value={currentCategoria}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-xl border border-brand-dark/20 bg-white py-3 px-4 text-brand-dark focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <button
            type="submit"
            onClick={handleSearch}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-brand-yellow px-6 py-3 font-semibold text-brand-dark transition-all hover:bg-brand-yellow/90 hover:shadow-lg disabled:opacity-50"
          >
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">Buscar</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl border-2 border-brand-dark/20 bg-white px-6 py-3 font-semibold text-brand-dark transition-all hover:border-brand-red hover:bg-brand-red/5 hover:text-brand-red disabled:opacity-50"
            >
              <X className="h-5 w-5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Indicador de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-brand-dark/60">Filtros ativos:</span>
          {currentNome && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-brand-yellow/20 px-3 py-1 text-sm font-semibold text-brand-dark">
              Nome: {currentNome}
            </span>
          )}
          {currentCategoria && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-brand-orange/20 px-3 py-1 text-sm font-semibold text-brand-dark">
              Categoria: {categories.find(c => c.id === Number(currentCategoria))?.category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
