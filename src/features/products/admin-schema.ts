import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .transform((value) => value || null);

const optionalImageUrl = z
  .string()
  .trim()
  .max(2048, "A URL da imagem é muito longa.")
  .refine((value) => {
    if (!value || value.startsWith("/")) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Informe uma URL HTTP/HTTPS ou um caminho local iniciado por /.")
  .transform((value) => value || null);

export const productFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .transform((value) => value || null),
  nome: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(120, "Use no máximo 120 caracteres."),
  id_categoria: z.coerce
    .number("Selecione uma categoria.")
    .int()
    .positive("Selecione uma categoria."),
  id_subcategoria: z.coerce
    .number("Selecione uma subcategoria.")
    .int()
    .positive("Selecione uma subcategoria."),
  descricao: optionalText(2000),
  image_url: optionalImageUrl,
});

export const updateProductFormSchema = productFormSchema.extend({
  id: z.coerce.number().int().positive("Produto inválido."),
});

export type ProductFormValues = z.input<typeof productFormSchema>;
export type NormalizedProductFormValues = z.output<typeof productFormSchema>;

export function productFormDataToObject(formData: FormData) {
  return {
    id: formData.get("id"),
    codigo: formData.get("codigo") ?? "",
    nome: formData.get("nome"),
    id_categoria: formData.get("id_categoria"),
    id_subcategoria: formData.get("id_subcategoria"),
    descricao: formData.get("descricao") ?? "",
    image_url: formData.get("image_url") ?? "",
  };
}
