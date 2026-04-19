import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, ShieldCheck, Truck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailActions from "@/components/products/ProductDetailActions";
import ProductViewTracker from "@/components/products/ProductViewTracker";
import RelatedProductsGrid from "@/components/products/RelatedProductsGrid";
import {
  getProductById,
  getRelatedProducts,
  parseProductId,
} from "@/features/products/data";
import { getProductCategory } from "@/features/products/types";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

function truncateDescription(description: string): string {
  if (description.length <= 155) return description;
  return `${description.slice(0, 152)}...`;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) {
    return {
      title: "Produto | Ingapan",
      description: "Detalhes do produto no catálogo Ingapan.",
    };
  }

  const product = await getProductById(productId);
  if (!product) {
    return {
      title: "Produto não encontrado | Ingapan",
      description: "Produto não encontrado no catálogo Ingapan.",
    };
  }

  return {
    title: `${product.nome} | Ingapan`,
    description: truncateDescription(product.descricao),
    openGraph: {
      title: `${product.nome} | Ingapan`,
      description: truncateDescription(product.descricao),
      images: [product.image_url],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const productId = parseProductId(id);

  if (!productId) {
    notFound();
  }

  const product = await getProductById(productId);
  if (!product) {
    notFound();
  }

  const category = getProductCategory(product);
  const relatedProducts = await getRelatedProducts(product.id, product.id_categoria);

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-brand-light/30 via-white to-white pt-24 md:pt-28">
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-brand-dark/65">
              <li>
                <Link href="/" className="transition-colors hover:text-brand-red">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/produtos" className="transition-colors hover:text-brand-red">
                  Produtos
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-brand-dark">{product.nome}</li>
            </ol>
          </nav>

          <article className="overflow-hidden rounded-3xl border border-brand-dark/10 bg-white shadow-xl shadow-black/5">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="relative min-h-[320px] bg-brand-light sm:min-h-[420px]">
                <Image
                  src={product.image_url}
                  alt={product.nome}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  {category ? (
                    <span className="inline-flex rounded-full border border-brand-yellow/40 bg-brand-yellow/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
                      {category.category}
                    </span>
                  ) : null}
                  <span className="inline-flex rounded-full border border-brand-dark/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark/70">
                    Cód. #{product.id}
                  </span>
                </div>

                <h1 className="mt-4 font-[var(--font-heading)] text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
                  {product.nome}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-brand-dark/75 md:text-lg">
                  {product.descricao}
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-brand-dark/10 bg-brand-light/60 p-3">
                    <ShieldCheck className="h-5 w-5 text-brand-olive" />
                    <p className="mt-2 text-sm font-semibold text-brand-dark">
                      Qualidade selecionada
                    </p>
                  </div>
                  <div className="rounded-xl border border-brand-dark/10 bg-brand-light/60 p-3">
                    <Truck className="h-5 w-5 text-brand-red" />
                    <p className="mt-2 text-sm font-semibold text-brand-dark">
                      Parceiro para revenda
                    </p>
                  </div>
                  <div className="rounded-xl border border-brand-dark/10 bg-brand-light/60 p-3">
                    <Clock3 className="h-5 w-5 text-brand-orange" />
                    <p className="mt-2 text-sm font-semibold text-brand-dark">
                      Atendimento ágil
                    </p>
                  </div>
                </div>

                <ProductDetailActions product={product} />

                <div className="mt-6 border-t border-brand-dark/10 pt-6">
                  <Link
                    href="/produtos"
                    className="inline-flex items-center rounded-lg text-sm font-semibold text-brand-dark/75 transition-colors hover:text-brand-red"
                  >
                    ← Voltar ao catálogo
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </section>

        <RelatedProductsGrid products={relatedProducts} />
      </main>

      <Footer />
    </>
  );
}
