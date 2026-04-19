"use client";

import { useCart } from "@/lib/CartContext";
import { X, Plus, Minus, Trash2, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { useToast } from "@/components/Toast";

export default function CartSidebar() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, itemCount } = useCart();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const { addToast } = useToast();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeCart();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleWhatsAppCheckout = async () => {
    if (items.length === 0 || isSubmittingCheckout) return;

    // Get WhatsApp number from constants or fallback
    const whatsappLink = SOCIAL_LINKS.find(link => link.name === "WhatsApp")?.url || "https://wa.me/5544999999999";
    const phoneNumber = whatsappLink.replace("https://wa.me/", "");

    const messageStart = "Olá! Gostaria de solicitar um orçamento para os seguintes produtos:\n\n";
    
    const itemsList = items
      .map((item) => `- ${item.quantity}x ${item.product.nome} (Cód. #${item.product.id})`)
      .join("\n");
      
    const messageEnd = "\n\nAguardo o retorno com os valores.";
    
    const fullMessage = encodeURIComponent(messageStart + itemsList + messageEnd);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${fullMessage}`;

    setIsSubmittingCheckout(true);
    try {
      const response = await fetch("/api/orders/checkout-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        addToast("Não foi possível registrar o pedido. Tente novamente.", "error");
        return;
      }

      window.location.assign(whatsappUrl);
    } catch {
      addToast("Erro de conexão ao registrar o pedido.", "error");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 className="font-[var(--font-heading)] text-xl font-bold text-brand-dark">
            Meu Carrinho ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-red"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-brand-light p-6">
                <Send className="h-12 w-12 text-brand-dark/20" />
              </div>
              <h3 className="text-lg font-semibold text-brand-dark">
                Seu carrinho está vazio
              </h3>
              <p className="mt-2 max-w-xs text-sm text-gray-500">
                Adicione produtos para solicitar um orçamento personalizado.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 rounded-xl bg-brand-yellow px-6 py-3 font-semibold text-brand-dark transition-all hover:bg-brand-yellow/90 hover:shadow-lg"
              >
                Ver Produtos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-brand-yellow/30 hover:shadow-md"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.nome}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="line-clamp-1 font-semibold text-brand-dark">
                        {item.product.nome}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Cód. #{item.product.id}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="rounded p-1 text-gray-500 hover:bg-white hover:text-brand-red hover:shadow-sm"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-semibold text-brand-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="rounded p-1 text-gray-500 hover:bg-white hover:text-brand-olive hover:shadow-sm"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        title="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 p-5">
            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
              <span>Total de Itens:</span>
              <span className="font-bold text-brand-dark">{itemCount} itens</span>
            </div>
            
            <button
              onClick={handleWhatsAppCheckout}
              disabled={isSubmittingCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-bold text-white transition-all hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-green-900/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#8ad9ac] disabled:shadow-none"
            >
              <Send className="h-5 w-5" />
              {isSubmittingCheckout
                ? "Registrando pedido..."
                : "Solicitar Orçamento via WhatsApp"}
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              Você será redirecionado para o WhatsApp para confirmar o pedido.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
