import Image from "next/image";
import Link from "next/link";
import type { ProductCategory } from "@/types";

interface ProductCardProps {
  product: ProductCategory;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasProductDetailPage = /^\d+$/.test(product.id);

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <Link
        href={hasProductDetailPage ? `/produtos/${product.id}` : "/produtos"}
        className="block"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        <div className="p-5">
          <h3 className="font-[var(--font-heading)] text-lg font-semibold text-brand-dark">
            {product.name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {product.description}
          </p>
        </div>
      </Link>
      <div className="h-[3px] w-full bg-gradient-to-r from-brand-yellow to-brand-red" />
    </div>
  );
}
