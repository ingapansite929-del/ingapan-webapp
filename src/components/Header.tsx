"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/LOGO.png"
              alt="IngaPan"
              width={2045}
              height={1386}
              className={`h-12 w-auto md:h-14 transition-all duration-300 ${
                isScrolled ? "brightness-100" : "brightness-0 invert"
              }`}
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/produtos"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 md:px-5 md:py-2.5 md:text-base ${
                isScrolled
                  ? "bg-brand-yellow/10 text-brand-dark hover:bg-brand-yellow/20"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Produtos
            </Link>
            <Link
              href="/auth/login"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105 md:px-5 md:py-2.5 md:text-base ${
                isScrolled
                  ? "bg-brand-dark/10 text-brand-dark hover:bg-brand-dark/20"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Área do Cliente
            </Link>
            <button
              onClick={() => scrollToSection("contato")}
              className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-brand-red/90 md:px-6 md:py-3 md:text-base"
            >
              Fale Conosco
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
