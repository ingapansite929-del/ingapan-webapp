import { describe, expect, it } from "vitest";
import { productFormSchema } from "@/features/products/admin-schema";

describe("formulário administrativo de produto", () => {
  it("aceita imagem e descrição opcionais", () => {
    const result = productFormSchema.parse({
      nome: "Pão de queijo",
      id_categoria: "2",
      id_subcategoria: "8",
      descricao: "",
      image_url: "",
    });

    expect(result.descricao).toBeNull();
    expect(result.image_url).toBeNull();
  });

  it("retorna erros para categoria, subcategoria e URL inválidas", () => {
    const result = productFormSchema.safeParse({
      nome: "A",
      id_categoria: "",
      id_subcategoria: "",
      descricao: "",
      image_url: "ftp://example.com/image.png",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.nome).toBeDefined();
      expect(fields.id_categoria).toBeDefined();
      expect(fields.id_subcategoria).toBeDefined();
      expect(fields.image_url).toBeDefined();
    }
  });
});
