import { ChevronDown } from "lucide-react";
import HeroCTAs from "./HeroCTAs";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-brand-dark">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/ingapan_presentation.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-[fade-in-up_0.8s_ease-out_forwards]">
          <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Qualidade e Variedade na{" "}
            <span className="text-brand-yellow">Distribuição</span> de Alimentos
          </h1>

          <p className="mt-4 text-lg font-light leading-relaxed text-gray-200 md:mt-6 md:text-xl lg:text-2xl">
            Somos a Ingapan, sua parceira em distribuição de produtos
            alimentícios. Trabalhamos com as melhores marcas para abastecer
            seu negócio com eficiência e confiança.
          </p>

          <HeroCTAs />
        </div>
      </div>

      <a
        href="#produtos"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce-slow text-white/70 transition-colors hover:text-white"
        aria-label="Rolar para produtos"
      >
        <ChevronDown size={36} />
      </a>
    </section>
  );
}
