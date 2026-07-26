"use client";

import Link from "next/link";

export default function HeroCTAs() {
  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row md:mt-10">
      <Link
        href="/produtos"
        className="rounded-full bg-brand-yellow px-8 py-4 text-lg font-semibold text-brand-dark transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-brand-yellow/25"
      >
        Conheça Nossos Produtos
      </Link>

      <button
        onClick={scrollToContact}
        className="rounded-full border-2 border-white/60 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10"
      >
        Fale Conosco
      </button>
    </div>
  );
}
