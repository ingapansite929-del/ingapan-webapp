"use client";

import { ChevronDown } from "lucide-react";

export default function Hero() {
  const scrollToProducts = () => {
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
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

          <div className="mt-8 flex flex-col gap-4 sm:flex-row md:mt-10">
            <button
              onClick={scrollToProducts}
              className="rounded-full bg-brand-yellow px-8 py-4 text-lg font-semibold text-brand-dark transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-brand-yellow/25"
            >
              Conheça Nossos Produtos
            </button>

            <button
              onClick={scrollToContact}
              className="rounded-full border-2 border-white/60 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10"
            >
              Fale Conosco
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToProducts}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce-slow text-white/70 transition-colors hover:text-white"
        aria-label="Rolar para produtos"
      >
        <ChevronDown size={36} />
      </button>
    </section>
  );
}
