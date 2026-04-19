"use client";

import { MessageCircle, ShoppingCart } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { useCart } from "@/lib/CartContext";
import type { ProductRecord } from "@/features/products/types";

interface ProductDetailActionsProps {
  product: ProductRecord;
}

export default function ProductDetailActions({
  product,
}: ProductDetailActionsProps) {
  const { addItem } = useCart();

  const handleWhatsAppQuote = () => {
    const whatsappLink =
      SOCIAL_LINKS.find((link) => link.name === "WhatsApp")?.url ??
      "https://wa.me/5544999999999";
    const phoneNumber = whatsappLink.replace("https://wa.me/", "");

    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto "${product.nome}" (Cód. #${product.id}). Gostaria de receber mais informações e orçamento.`
    );

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => addItem(product)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-6 py-3.5 font-semibold text-brand-dark transition-all hover:bg-brand-yellow/90 hover:shadow-lg active:scale-[0.99]"
      >
        <ShoppingCart className="h-5 w-5" />
        Adicionar ao carrinho
      </button>

      <button
        type="button"
        onClick={handleWhatsAppQuote}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-semibold text-white transition-all hover:bg-[#20bd5a] hover:shadow-lg active:scale-[0.99]"
      >
        <MessageCircle className="h-5 w-5" />
        Solicitar orçamento
      </button>
    </div>
  );
}
