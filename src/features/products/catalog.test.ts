import { describe, expect, it } from "vitest";
import {
  buildProductsUrl,
  createCatalogNavigationLock,
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

  it("aceita somente uma navegação enquanto a anterior está pendente", () => {
    const lock = createCatalogNavigationLock();
    const attempts = Array.from({ length: 20 }, () =>
      lock.tryStart("/produtos?page=20")
    );

    expect(attempts.filter(Boolean)).toHaveLength(1);
    expect(lock.current()).toBe("/produtos?page=20");

    lock.release();
    expect(lock.tryStart("/produtos?page=21")).toBe(true);
  });
});
