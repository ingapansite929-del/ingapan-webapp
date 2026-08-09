"use client";

import { MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import type { ProductRecord } from "@/features/products/types";
import { buildSingleProductQuoteMessage } from "@/features/products/quote";
import { WHATSAPP_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface ProductDetailActionsProps {
  product: ProductRecord;
}

export default function ProductDetailActions({
  product,
}: ProductDetailActionsProps) {
  const { addItem } = useCart();

  const handleWhatsAppQuote = () => {
    const message = encodeURIComponent(buildSingleProductQuoteMessage(product));

    window.open(`${WHATSAPP_URL}?text=${message}`, "_blank");
  };

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        onClick={(event) =>
          addItem(product, { sourceElement: event.currentTarget })
        }
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
