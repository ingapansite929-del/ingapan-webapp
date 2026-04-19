"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface Product {
  id: number;
  nome: string;
  image_url: string;
  id_categoria: number;
  descricao: string;
  product_categoria?: { id: number; category: string }[] | { id: number; category: string } | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const savedCart = localStorage.getItem("cart-storage");
    if (!savedCart) {
      return [];
    }

    try {
      const parsedCart: unknown = JSON.parse(savedCart);
      return Array.isArray(parsedCart) ? (parsedCart as CartItem[]) : [];
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem("cart-storage", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        addToast("Quantidade atualizada no carrinho!", "success");
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      addToast("Produto adicionado ao carrinho!", "success");
      return [...currentItems, { product, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
    addToast("Produto removido do carrinho", "info");
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
    addToast("Carrinho limpo", "info");
  };

  const toggleCart = () => setIsOpen((prev) => !prev);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
