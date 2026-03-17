import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import Footer from "@/components/Footer";
import SocialWidget from "@/components/SocialWidget";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductCarousel />
      </main>
      <Footer />
      <SocialWidget />
    </>
  );
}
