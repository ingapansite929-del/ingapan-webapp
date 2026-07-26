"use client";

import { MessageCircle, ShoppingCart } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { useCart } from "@/lib/CartContext";
import type { ProductRecord } from "@/features/products/types";
import { Button } from "@/components/ui/button";

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
      <Button
        type="button"
        onClick={() => addItem(product)}
        variant="secondary"
        size="lg"
      >
        <ShoppingCart className="h-5 w-5" />
        Adicionar ao orçamento
      </Button>

      <Button
        type="button"
        onClick={handleWhatsAppQuote}
        size="lg"
        className="bg-[var(--brand-whatsapp)] text-white hover:opacity-90"
      >
        <MessageCircle className="h-5 w-5" />
        Solicitar orçamento
      </Button>
    </div>
  );
}
