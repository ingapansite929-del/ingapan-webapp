"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import UserMenu from "./UserMenu";

interface AuthUser {
  email?: string | null;
}

interface HeaderProps {
  initialUser?: AuthUser | null;
}

export default function Header({ initialUser = null }: HeaderProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openCart, itemCount } = useCart();
  const pathname = usePathname();

  // Determina nível de scroll: 0 = topo (0-20px), 1 = pouco (20-100px), 2 = bastante (100px+)
  const scrollLevel = scrollY < 20 ? 0 : scrollY < 100 ? 1 : 2;

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };

    // Chamar uma vez ao montar
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  }, []);

  // Classes dinâmicas para o header
  // - Sempre tem elevação (backdrop-blur para visibilidade)
  // - Transição suave entre estados
  const headerClasses = scrollLevel === 0
    ? "bg-black/[0.02] backdrop-blur-md border-b border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
    : "bg-white/92 backdrop-blur-md border-b border-brand-dark/10 shadow-[0_12px_28px_-24px_rgba(34,34,34,0.55)]";

  // Classes para o botão "Produtos" - sempre visível com bom contraste
  const produtosButtonClasses = pathname.startsWith("/produtos")
    ? "bg-brand-yellow text-brand-dark shadow-[0_10px_18px_-12px_rgba(249,207,0,0.85)]"
    : scrollLevel >= 1
      ? "bg-brand-dark/8 text-brand-dark hover:bg-brand-dark/12"
      : "bg-white/30 text-brand-dark hover:bg-brand-yellow hover:text-brand-red hover:shadow-[0_12px_22px_-14px_rgba(249,207,0,0.65)]";

  // Classes para botões de ícone
  const iconButtonClasses = scrollLevel >= 1
    ? "text-brand-dark bg-brand-dark/8 hover:bg-brand-dark/12"
    : "text-brand-dark bg-white/30 hover:bg-brand-yellow hover:text-brand-red hover:shadow-[0_12px_22px_-14px_rgba(249,207,0,0.65)]";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClasses}`}
      >
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="group relative -ml-2 flex items-center rounded-lg px-2 py-1 transition-all duration-200 hover:bg-black/5"
              title="Voltar ao início"
            >
              <Image
                src="/images/LOGO.png"
                alt="IngaPan"
                width={300}
                height={203}
                sizes="(max-width: 768px) 96px, 112px"
                className="h-10 w-auto md:h-12 transition-all duration-300"
                priority
                fetchPriority="high"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* Link "Produtos" */}
              <Link
                href="/produtos"
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${produtosButtonClasses}`}
              >
                Produtos
              </Link>

              {/* Separador visual */}
              <div className="h-6 w-px bg-black/10" />

              {/* User Menu */}
              <UserMenu initialUser={initialUser} scrollLevel={scrollLevel} />

              {/* Cart Button */}
              <button
                onClick={openCart}
                data-cart-trigger
                className={`group relative cursor-pointer rounded-full p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(34,34,34,0.35)] active:scale-[0.97] ${iconButtonClasses}`}
                aria-label="Abrir carrinho"
                title="Carrinho de compras"
              >
                <ShoppingCart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white shadow-[0_4px_12px_rgba(186,37,30,0.4)]">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* CTA "Fale Conosco" */}
              <button
                onClick={() => scrollToSection("contato")}
                className="rounded-full bg-brand-red px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red/90 hover:shadow-[0_14px_24px_-14px_rgba(186,37,30,0.85)] active:translate-y-px"
              >
                Fale Conosco
              </button>
            </nav>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-2">
              {/* Cart Button Mobile */}
              <button
                onClick={openCart}
                data-cart-trigger
                className={`group relative cursor-pointer rounded-full p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(34,34,34,0.35)] active:scale-[0.97] ${iconButtonClasses}`}
                aria-label="Abrir carrinho"
                title="Carrinho de compras"
              >
                <ShoppingCart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white shadow-[0_4px_12px_rgba(186,37,30,0.4)]">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Menu Mobile */}
              <UserMenu initialUser={initialUser} scrollLevel={scrollLevel} />

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`rounded-full p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-14px_rgba(34,34,34,0.35)] active:scale-[0.97] ${iconButtonClasses}`}
                aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm md:hidden">
          <nav className="flex flex-col gap-2 bg-white/95 backdrop-blur-md border-b border-brand-dark/10 p-4 shadow-lg">
            <Link
              href="/produtos"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-base font-semibold transition-all duration-200 ${
                pathname.startsWith("/produtos")
                  ? "bg-brand-yellow text-brand-dark"
                  : "text-brand-dark hover:bg-brand-dark/5"
              }`}
            >
              Produtos
            </Link>

            <button
              onClick={() => scrollToSection("contato")}
              className="rounded-lg bg-brand-red px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-brand-red/90 active:scale-[0.98]"
            >
              Fale Conosco
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
