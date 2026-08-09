"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useToast } from "@/components/Toast";
import ProductImage from "@/components/products/ProductImage";
import {
  parseProductRecord,
  type ProductRecord,
} from "@/features/products/types";

export interface CartItem {
  product: ProductRecord;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  addItem: (
    product: ProductRecord,
    options?: { sourceElement?: Element | null }
  ) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartFlight {
  id: number;
  product: ProductRecord;
  from: DOMRect;
  to: DOMRect;
}

interface FlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function getCartFlightMotion(
  from: FlightRect,
  to: FlightRect,
  size = 80
) {
  const halfSize = size / 2;
  const startLeft = from.left + from.width / 2 - halfSize;
  const startTop = from.top + from.height / 2 - halfSize;
  const targetLeft = to.left + to.width / 2 - halfSize;
  const targetTop = to.top + to.height / 2 - halfSize;
  const deltaX = targetLeft - startLeft;
  const deltaY = targetTop - startTop;

  return {
    startLeft,
    startTop,
    x: [0, deltaX * 0.22, deltaX * 0.72, deltaX],
    y: [0, -64, Math.min(-24, deltaY * 0.72), deltaY],
  };
}

function CartFlightAnimation({
  flight,
  onComplete,
}: {
  flight: CartFlight;
  onComplete: () => void;
}) {
  const motionPath = getCartFlightMotion(flight.from, flight.to);

  return (
    <motion.div
      data-cart-flight
      className="pointer-events-none fixed z-[100] size-20 overflow-hidden rounded-2xl border-2 border-brand-yellow bg-card shadow-2xl"
      style={{ left: motionPath.startLeft, top: motionPath.startTop }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: motionPath.x,
        y: motionPath.y,
        scale: [1, 1, 0.82, 0.38],
        opacity: [1, 1, 0.96, 0],
      }}
      transition={{
        duration: 0.95,
        times: [0, 0.36, 0.78, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={onComplete}
      aria-hidden="true"
    >
      <div className="relative size-full">
        <ProductImage
          src={flight.product.image_url}
          alt=""
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
    </motion.div>
  );
}

export function parseStoredCart(rawValue: string | null): CartItem[] {
  if (!rawValue) return [];

  try {
    const parsedCart: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedCart)) return [];
    return parsedCart.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const candidate = item as { product?: unknown; quantity?: unknown };
      const product = parseProductRecord(candidate.product);
      const quantity = Number(candidate.quantity);
      return product && Number.isInteger(quantity) && quantity > 0
        ? [{ product, quantity }]
        : [];
    });
  } catch {
    return [];
  }
}

function getVisibleCartTarget(): DOMRect | null {
  const triggers = document.querySelectorAll<HTMLElement>("[data-cart-trigger]");
  for (const trigger of triggers) {
    const rect = trigger.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }
  return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [flight, setFlight] = useState<CartFlight | null>(null);
  const { addToast } = useToast();
  const hydratedRef = useRef(false);
  const flightIdRef = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hydratedRef.current) return;
      setItems(parseStoredCart(localStorage.getItem("cart-storage")));
      hydratedRef.current = true;
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem("cart-storage", JSON.stringify(items));
  }, [items]);

  const addItem: CartContextType["addItem"] = (product, options) => {
    hydratedRef.current = true;
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { product, quantity: 1 }];
    });

    if (reducedMotion || !options?.sourceElement) return;
    const target = getVisibleCartTarget();
    if (!target) return;

    flightIdRef.current += 1;
    setFlight({
      id: flightIdRef.current,
      product,
      from: options.sourceElement.getBoundingClientRect(),
      to: target,
    });
  };

  const removeItem = (productId: number) => {
    hydratedRef.current = true;
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    hydratedRef.current = true;
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
    hydratedRef.current = true;
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
      <AnimatePresence>
        {flight ? (
          <CartFlightAnimation
            key={flight.id}
            flight={flight}
            onComplete={() =>
              setFlight((current) =>
                current?.id === flight.id ? null : current
              )
            }
          />
        ) : null}
      </AnimatePresence>
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
