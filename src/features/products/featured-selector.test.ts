import { describe, expect, it } from "vitest";
import {
  featuredSelectorInputSchema,
  normalizeFeaturedSelectableProducts,
} from "@/features/products/featured-selector";

describe("seletor de novos produtos em destaque", () => {
  it("valida paginação e filtros combináveis", () => {
    const result = featuredSelectorInputSchema.parse({
      page: 2,
      search: "  chocolate  ",
      categoryId: 4,
      subcategoryId: 9,
      excludedProductIds: [12, 7, 12],
    });

    expect(result).toEqual({
      page: 2,
      search: "chocolate",
      categoryId: 4,
      subcategoryId: 9,
      excludedProductIds: [12, 7],
    });
  });

  it("rejeita página, filtros e exclusões inválidos", () => {
    expect(
      featuredSelectorInputSchema.safeParse({
        page: 0,
        categoryId: -1,
        subcategoryId: 2.5,
        excludedProductIds: Array.from({ length: 11 }, (_, index) => index + 1),
      }).success
    ).toBe(false);
  });

  it("normaliza somente os dados exibidos nos cards compactos", () => {
    const products = normalizeFeaturedSelectableProducts([
      {
        id: 41,
        nome: "Chocolate em gotas",
        image_url: "https://example.com/chocolate.png",
      },
    ]);

    expect(products).toEqual([
      {
        id: 41,
        nome: "Chocolate em gotas",
        imageUrl: "https://example.com/chocolate.png",
      },
    ]);
  });
});
