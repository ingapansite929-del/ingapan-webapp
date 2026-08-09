import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Clock3, ShieldCheck, Truck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailActions from "@/components/products/ProductDetailActions";
import ProductImage from "@/components/products/ProductImage";
import ProductViewTracker from "@/components/products/ProductViewTracker";
import RelatedProductsGrid from "@/components/products/RelatedProductsGrid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProductById,
  getRelatedProducts,
  parseProductId,
} from "@/features/products/data";
import {
  getProductCategory,
  getProductDescription,
  getProductSubcategory,
  getSafeImageUrl,
} from "@/features/products/types";
import { formatProductReference } from "@/features/products/quote";
import { getSiteUrl } from "@/lib/seo";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

async function RelatedProductsSection({
  productId,
  categoryId,
}: {
  productId: number;
  categoryId: number | null;
}) {
  const relatedProducts = await getRelatedProducts(productId, categoryId);
  return <RelatedProductsGrid products={relatedProducts} />;
}

function RelatedProductsSkeleton() {
  return (
    <section
      className="mx-auto mt-12 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      aria-label="Carregando produtos relacionados"
    >
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-5 w-96 max-w-full" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border bg-card">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function truncateDescription(description: string | null): string {
  const normalized =
    description?.trim() ||
    "Consulte a IngaPan para conhecer detalhes, disponibilidade e condições deste produto.";
  if (normalized.length <= 155) return normalized;
  return `${normalized.slice(0, 152)}...`;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) {
    return {
      title: "Produto",
      description: "Detalhes do produto no catálogo Ingapan.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const product = await getProductById(productId);
  if (!product) {
    return {
      title: "Produto não encontrado",
      description: "Produto não encontrado no catálogo Ingapan.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const canonicalPath = `/produtos/${product.id}`;
  const description = truncateDescription(product.descricao);
  const imageUrl = getSafeImageUrl(product.image_url);

  return {
    title: product.nome,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${product.nome} | Ingapan`,
      description,
      url: canonicalPath,
      type: "article",
      ...(imageUrl
        ? { images: [{ url: imageUrl, alt: product.nome }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.nome} | Ingapan`,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
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
  const subcategory = getProductSubcategory(product);
  const imageUrl = getSafeImageUrl(product.image_url);
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/produtos/${product.id}`;
  const productReference = formatProductReference(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nome,
    description: getProductDescription(product),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "Ingapan",
    },
    ...(product.codigo ? { sku: product.codigo } : {}),
    category: category?.category,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Produtos",
        item: `${siteUrl}/produtos`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.nome,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
                <ProductImage
                  src={product.image_url}
                  alt={product.nome}
                  fill
                  className="object-cover"
                  priority
                  loading="eager"
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
                  {subcategory ? (
                    <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {subcategory.subcategoria}
                    </span>
                  ) : null}
                  {productReference ? (
                    <span className="inline-flex rounded-full border border-brand-dark/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark/70">
                      {productReference}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 font-[var(--font-heading)] text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
                  {product.nome}
                </h1>
                {product.descricao ? (
                  <p className="mt-4 text-base leading-relaxed text-brand-dark/75 md:text-lg">
                    {product.descricao}
                  </p>
                ) : null}

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

        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsSection
            productId={product.id}
            categoryId={product.id_categoria}
          />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
