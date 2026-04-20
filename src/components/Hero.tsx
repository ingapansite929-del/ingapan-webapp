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
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden">
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

      <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/62 to-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(249,207,0,0.2),transparent_42%),radial-gradient(circle_at_90%_80%,rgba(186,37,30,0.18),transparent_38%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl animate-[fade-in-up_0.8s_ease-out_forwards]">
          <p className="inline-flex rounded-full border border-white/25 bg-white/5 px-4 py-2 text-xs font-medium tracking-[0.16em] text-white/80 uppercase backdrop-blur-sm">
            Distribuição alimentar com operação própria
          </p>

          <h1 className="mt-5 font-[var(--font-heading)] text-4xl leading-[0.95] font-bold tracking-[-0.03em] text-white md:text-5xl lg:text-7xl">
            Qualidade e Variedade na{" "}
            <span className="text-brand-yellow">Distribuição</span> de Alimentos
          </h1>

          <p className="mt-5 max-w-[62ch] text-lg font-normal leading-relaxed text-gray-100 md:mt-7 md:text-xl lg:text-2xl">
            Somos a Ingapan, sua parceira em distribuição de produtos
            alimentícios. Trabalhamos com as melhores marcas para abastecer
            seu negócio com eficiência e confiança.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row md:mt-10">
            <button
              onClick={scrollToProducts}
              className="rounded-full bg-brand-yellow px-8 py-4 text-lg font-semibold text-brand-dark transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-16px_rgba(249,207,0,0.75)] active:translate-y-px"
            >
              Conheça Nossos Produtos
            </button>

            <button
              onClick={scrollToContact}
              className="rounded-full border-2 border-white/55 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10 active:translate-y-px"
            >
              Fale Conosco
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToProducts}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/30 bg-white/10 p-2 text-white/80 backdrop-blur-sm transition-colors hover:text-white"
        aria-label="Rolar para produtos"
      >
        <ChevronDown size={36} />
      </button>
    </section>
  );
}
