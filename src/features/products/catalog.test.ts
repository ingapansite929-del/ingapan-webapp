import { describe, expect, it } from "vitest";
import {
  buildProductsUrl,
  getPaginationItems,
} from "@/features/products/catalog";

describe("filtros e paginação do catálogo", () => {
  it("serializa todos os filtros e preserva-os ao trocar de página", () => {
    expect(
      buildProductsUrl(
        {
          nome: "pão",
          categoria: "2",
          subcategoria: "8",
          ordem: "codigo-desc",
        },
        3
      )
    ).toBe(
      "/produtos?nome=p%C3%A3o&categoria=2&subcategoria=8&ordem=codigo-desc&page=3"
    );
  });

  it("insere reticências em paginações extensas", () => {
    expect(getPaginationItems(6, 12)).toEqual([
      1,
      "ellipsis",
      5,
      6,
      7,
      "ellipsis",
      12,
    ]);
  });
});
