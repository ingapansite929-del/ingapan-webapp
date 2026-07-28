import { describe, expect, it } from "vitest";
import { getCartFlightMotion, parseStoredCart } from "@/lib/CartContext";

describe("persistência do carrinho", () => {
  it("normaliza um carrinho válido salvo no navegador", () => {
    const items = parseStoredCart(
      JSON.stringify([
        {
          product: {
            id: 136,
            nome: "Produto de teste",
            id_categoria: 2,
            id_subcategoria: 8,
            descricao: null,
            image_url: null,
            product_categoria: { id: 2, category: "Confeitaria" },
            product_subcategory: {
              id: 8,
              subcategoria: "Formas",
            },
          },
          quantity: 2,
        },
      ])
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      quantity: 2,
      product: { id: 136, descricao: null, image_url: null },
    });
  });

  it("descarta conteúdo inválido sem lançar exceção", () => {
    expect(parseStoredCart("{inválido")).toEqual([]);
    expect(parseStoredCart(JSON.stringify([{ quantity: 1 }]))).toEqual([]);
  });
});

describe("animação do produto até o carrinho", () => {
  it("calcula uma trajetória horizontal e termina centralizada no carrinho", () => {
    const motion = getCartFlightMotion(
      { left: 100, top: 640, width: 240, height: 240 },
      { left: 1180, top: 20, width: 48, height: 48 }
    );

    expect(motion.x[1]).toBeGreaterThan(0);
    expect(motion.x.at(-1)).toBe(984);
    expect(motion.y.at(-1)).toBe(-716);
    expect(motion.startLeft).toBe(180);
    expect(motion.startTop).toBe(720);
  });
});
