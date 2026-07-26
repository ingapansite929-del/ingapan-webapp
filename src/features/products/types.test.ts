import { describe, expect, it } from "vitest";
import {
  getSafeImageUrl,
  parseProductRecord,
} from "@/features/products/types";

describe("contrato de produto", () => {
  it("normaliza descrição e imagem nulas sem descartar o produto", () => {
    const product = parseProductRecord({
      id: 554,
      nome: "Produto sem mídia",
      id_categoria: 2,
      id_subcategoria: 8,
      descricao: null,
      image_url: null,
      product_categoria: [{ id: 2, category: "Congelados" }],
      product_subcategory: [{ id: 8, subcategoria: "Salgados" }],
    });

    expect(product).toMatchObject({
      id: 554,
      descricao: null,
      image_url: null,
      product_categoria: { id: 2, category: "Congelados" },
      product_subcategory: { id: 8, subcategoria: "Salgados" },
    });
  });

  it("rejeita protocolos inseguros e strings vazias de imagem", () => {
    expect(getSafeImageUrl("")).toBeNull();
    expect(getSafeImageUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeImageUrl("https://example.com/item.png")).toBe(
      "https://example.com/item.png"
    );
  });
});
