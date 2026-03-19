"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, Filter, Loader2 } from "lucide-react";

interface Category {
  id: number;
  category: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilter = useCallback(
    (formData: FormData) => {
      const nome = formData.get("nome")?.toString() || "";
      const categoriaId = formData.get("categoria_id")?.toString() || "";

      const params = new URLSearchParams(searchParams.toString());
      if (nome) {
        params.set("nome", nome);
      } else {
        params.delete("nome");
      }

      if (categoriaId) {
        params.set("categoria_id", categoriaId);
      } else {
        params.delete("categoria_id");
      }
      
      // Reset page when filtering
      params.delete("page");

      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  return (
    <form
      action={handleFilter}
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto"
    >
      <div className="relative flex-1 xl:w-48">
        <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-brand-dark/30" />
        <input
          name="nome"
          defaultValue={searchParams.get("nome") || ""}
          placeholder="Filtrar via Nome"
          className="w-full rounded-xl border-2 border-brand-dark/5 bg-brand-light/30 py-2.5 pl-10 pr-4 text-sm font-semibold text-brand-dark outline-none transition-all placeholder:font-medium placeholder:text-brand-dark/40 hover:bg-brand-light/60 focus:border-brand-dark/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
        />
      </div>
      <div className="relative flex-1 xl:w-48">
        <Filter className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-brand-dark/30" />
        <select
          name="categoria_id"
          defaultValue={searchParams.get("categoria_id") || ""}
          className="w-full rounded-xl border-2 border-brand-dark/5 bg-brand-light/30 py-2.5 pl-10 pr-4 text-sm font-semibold text-brand-dark outline-none transition-all hover:bg-brand-light/60 focus:border-brand-dark/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
        >
          <option value="">Todas categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-brand-dark px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-dark/90 active:scale-95 disabled:opacity-70 sm:w-auto"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Filtrar"}
      </button>
    </form>
  );
}
