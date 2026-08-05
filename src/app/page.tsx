import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import {
  parseFeaturedProductRows,
  resolveHomepageCarouselState,
  type HomepageCarouselState,
} from "@/features/products/featured";
import { PRODUCTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/seo";

// Code-split: ProductCarousel carrega Embla + Autoplay (~30KB),
// e SocialWidget só importa quando estiver pronto, fora do bundle crítico.
const ProductCarousel = dynamic(() => import("@/components/ProductCarousel"));
const SocialWidget = dynamic(() => import("@/components/SocialWidget"));

const HOME_TITLE = "Ingapan | Distribuidora de Alimentos em Maringá-PR";
const HOME_DESCRIPTION =
  "A Ingapan é distribuidora de produtos alimentícios em Maringá-PR. Qualidade, variedade e entrega ágil para abastecer padarias, mercados e o seu negócio.";

export const metadata: Metadata = {
  // `absolute` evita o sufixo "| Ingapan" do template do layout, já que este
  // título é auto-suficiente (marca + palavra-chave + cidade).
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    type: "website",
    images: [
      {
        url: "/images/LOGO.png",
        alt: "Logo da Ingapan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/images/LOGO.png"],
  },
};

function logHomepageCarouselError(
  context: string,
  error?: { code?: string; message?: string } | null
) {
  console.error("Não foi possível carregar os destaques da home", {
    context,
    code: error?.code,
    message: error?.message,
  });
}

async function getHomepageCarouselState(): Promise<HomepageCarouselState> {
  const supabase = await createClient();

  const { data: featuredRows, error: featuredError } = await supabase
    .from("products_featured")
    .select("id, product_id, display_order")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (featuredError) {
    logHomepageCarouselError("featured-query", featuredError);
    return { status: "error", reason: "featured-query" };
  }

  const rows = parseFeaturedProductRows(featuredRows);
  if (!rows) {
    logHomepageCarouselError("featured-data");
    return { status: "error", reason: "featured-data" };
  }

  if (rows.length === 0) {
    return resolveHomepageCarouselState({
      featuredRows: rows,
      productRows: null,
      placeholderProducts: PRODUCTS,
    });
  }

  const productIds = rows.map((row) => row.product_id);

  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, nome, descricao, image_url")
    .in("id", productIds);

  if (productsError) {
    logHomepageCarouselError("products-query", productsError);
    return { status: "error", reason: "products-query" };
  }

  const state = resolveHomepageCarouselState({
    featuredRows: rows,
    productRows: productsData,
    placeholderProducts: PRODUCTS,
  });
  if (state.status === "error") {
    logHomepageCarouselError(state.reason);
  }
  return state;
}

async function getInitialUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { email: user.email } : null;
}

export default async function Home() {
  const siteUrl = getSiteUrl();
  const [carouselState, initialUser] = await Promise.all([
    getHomepageCarouselState(),
    getInitialUser(),
  ]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Ingapan",
      url: siteUrl,
      logo: `${siteUrl}/images/LOGO.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Ingapan",
      url: siteUrl,
      inLanguage: "pt-BR",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header initialUser={initialUser} />
      <main id="conteudo-principal">
        <Hero />
        <AboutSection />
        <ProductCarousel state={carouselState} />
      </main>
      <Footer />
      <SocialWidget />
    </>
  );
}
