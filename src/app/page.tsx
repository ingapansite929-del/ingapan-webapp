import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/types";

// Code-split: ProductCarousel carrega Embla + Autoplay (~30KB),
// e SocialWidget só importa quando estiver pronto, fora do bundle crítico.
const ProductCarousel = dynamic(() => import("@/components/ProductCarousel"));
const SocialWidget = dynamic(() => import("@/components/SocialWidget"));

interface FeaturedRow {
  product_id: number;
  display_order: number;
}

interface ProductRow {
  id: number;
  nome: string | null;
  descricao: string | null;
  image_url: string | null;
}

async function getHomepageCarouselProducts(): Promise<ProductCategory[]> {
  const supabase = await createClient();

  const { data: featuredRows, error: featuredError } = await supabase
    .from("products_featured")
    .select("product_id, display_order")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });

  if (featuredError || !featuredRows || featuredRows.length === 0) {
    return PRODUCTS;
  }

  const rows = featuredRows as FeaturedRow[];
  const productIds = rows.map((row) => row.product_id);

  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, nome, descricao, image_url")
    .in("id", productIds);

  if (productsError || !productsData || productsData.length === 0) {
    return PRODUCTS;
  }

  const productsById = new Map(
    (productsData as ProductRow[]).map((product) => [product.id, product])
  );

  const mapped = rows
    .map((row) => {
      const product = productsById.get(row.product_id);
      if (!product || !product.nome || !product.descricao || !product.image_url) {
        return null;
      }

      return {
        id: String(product.id),
        name: product.nome,
        description: product.descricao,
        image: product.image_url,
      } satisfies ProductCategory;
    })
    .filter((product): product is ProductCategory => product !== null);

  return mapped.length > 0 ? mapped : PRODUCTS;
}

async function getInitialUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { email: user.email } : null;
}

export default async function Home() {
  const [carouselProducts, initialUser] = await Promise.all([
    getHomepageCarouselProducts(),
    getInitialUser(),
  ]);

  return (
    <>
      <Header initialUser={initialUser} />
      <main>
        <Hero />
        <AboutSection />
        <ProductCarousel products={carouselProducts} />
      </main>
      <Footer />
      <SocialWidget />
    </>
  );
}
