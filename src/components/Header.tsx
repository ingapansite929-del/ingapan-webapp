"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import UserMenu from "./UserMenu";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCart, itemCount } = useCart();
  const pathname = usePathname();

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
          ? "border-b border-brand-dark/10 bg-white/92 shadow-[0_12px_28px_-24px_rgba(34,34,34,0.55)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="flex items-center rounded-md">
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
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98] md:px-5 md:py-2.5 md:text-base ${
                pathname.startsWith("/produtos")
                  ? "bg-brand-yellow text-brand-dark shadow-[0_10px_18px_-12px_rgba(249,207,0,0.85)]"
                  : isScrolled
                    ? "bg-brand-yellow/10 text-brand-dark hover:bg-brand-yellow/20"
                    : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Produtos
            </Link>
            
            <UserMenu isScrolled={isScrolled} />
            
            <button
              onClick={openCart}
              className={`relative rounded-full p-2 transition-all duration-200 active:scale-[0.97] md:p-2.5 ${
                isScrolled
                  ? "bg-brand-dark/10 text-brand-dark hover:bg-brand-dark/20"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => scrollToSection("contato")}
              className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-red/90 hover:shadow-[0_14px_24px_-14px_rgba(186,37,30,0.85)] active:translate-y-px md:px-6 md:py-3 md:text-base"
            >
              Fale Conosco
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
