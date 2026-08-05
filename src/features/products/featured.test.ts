import { describe, expect, it } from "vitest";
import {
  parseFeaturedProductRows,
  resolveHomepageCarouselState,
  type FeaturedProductRow,
} from "@/features/products/featured";
import type { ProductCategory } from "@/types";

const PLACEHOLDER_PRODUCTS: ProductCategory[] = [
  {
    id: "catalogo",
    name: "Catálogo padrão",
    description: "Produto usado quando não há destaques.",
    image: "/images/LOGO.png",
  },
];

const FEATURED_ROWS: FeaturedProductRow[] = [
  { id: 4, product_id: 24, display_order: 2 },
  { id: 5, product_id: 297, display_order: 1 },
  { id: 3, product_id: 298, display_order: 3 },
  { id: 2, product_id: 314, display_order: 4 },
];

function product(
  id: number,
  description: string | null,
  image: string | null = `/p-${id}.png`
) {
  return {
    id,
    nome: `Produto ${id}`,
    descricao: description,
    image_url: image,
  };
}

describe("destaques da página inicial", () => {
  it("usa o catálogo padrão somente quando a tabela de destaques está vazia", () => {
    const state = resolveHomepageCarouselState({
      featuredRows: [],
      productRows: null,
      placeholderProducts: PLACEHOLDER_PRODUCTS,
    });

    expect(state).toEqual({
      status: "ready",
      source: "placeholder",
      products: PLACEHOLDER_PRODUCTS,
    });
  });

  it("renderiza produtos sem descrição com o texto padrão e na ordem configurada", () => {
    const state = resolveHomepageCarouselState({
      featuredRows: FEATURED_ROWS,
      productRows: [
        product(24, null),
        product(297, null),
        product(298, null),
        product(314, null),
      ],
      placeholderProducts: PLACEHOLDER_PRODUCTS,
    });

    expect(state.status).toBe("ready");
    if (state.status !== "ready") return;

    expect(state.source).toBe("featured");
    expect(state.products.map(({ id }) => id)).toEqual([
      "297",
      "24",
      "298",
      "314",
    ]);
    expect(state.products.every(({ description }) => description.length > 0)).toBe(
      true
    );
    expect(state.products).not.toEqual(PLACEHOLDER_PRODUCTS);
  });

  it("preserva a descrição cadastrada e aceita imagem nula", () => {
    const state = resolveHomepageCarouselState({
      featuredRows: [{ id: 1, product_id: 24, display_order: 1 }],
      productRows: [product(24, "Descrição cadastrada", null)],
      placeholderProducts: PLACEHOLDER_PRODUCTS,
    });

    expect(state).toMatchObject({
      status: "ready",
      source: "featured",
      products: [
        {
          id: "24",
          description: "Descrição cadastrada",
          image: null,
        },
      ],
    });
  });

  it("retorna erro quando um destaque não possui produto correspondente", () => {
    expect(
      resolveHomepageCarouselState({
        featuredRows: FEATURED_ROWS,
        productRows: [product(24, null)],
        placeholderProducts: PLACEHOLDER_PRODUCTS,
      })
    ).toEqual({ status: "error", reason: "products-data" });
  });

  it("rejeita registros de destaque inválidos", () => {
    expect(
      parseFeaturedProductRows([
        { id: 1, product_id: "inválido", display_order: 1 },
      ])
    ).toBeNull();
  });
});
