import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductCategory, type ProductRecord } from "@/features/products/types";

interface RelatedProductsGridProps {
  products: ProductRecord[];
}

export default function RelatedProductsGrid({ products }: RelatedProductsGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-12 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-heading)] text-2xl font-bold text-brand-dark md:text-3xl">
            Produtos relacionados
          </h2>
          <p className="mt-2 text-sm text-brand-dark/70">
            Veja outros itens da mesma categoria para ampliar seu mix.
          </p>
        </div>
        <Link
          href="/produtos"
          className="hidden rounded-lg border border-brand-dark/15 px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-dark hover:text-white md:inline-flex"
        >
          Ver catálogo completo
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const category = getProductCategory(product);

          return (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-brand-dark/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`/produtos/${product.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-light">
                  <Image
                    src={product.image_url}
                    alt={product.nome}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                <div className="p-5">
                  {category ? (
                    <span className="inline-flex rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
                      {category.category}
                    </span>
                  ) : null}

                  <h3 className="mt-3 line-clamp-2 font-[var(--font-heading)] text-lg font-bold text-brand-dark transition-colors group-hover:text-brand-red">
                    {product.nome}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-brand-dark/65">
                    {product.descricao}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red">
                    Ver detalhes <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
