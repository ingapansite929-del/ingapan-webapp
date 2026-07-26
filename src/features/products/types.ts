import { z } from "zod";

const nullableTextSchema = z
  .string()
  .nullable()
  .optional()
  .transform((value) => {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  });

export const productCategoryRelationSchema = z.object({
  id: z.coerce.number().int().positive(),
  category: z.string().trim().min(1),
});

export const productSubcategoryRelationSchema = z.object({
  id: z.coerce.number().int().positive(),
  subcategoria: z.string().trim().min(1),
});

function relationSchema<T extends z.ZodType>(schema: T) {
  return z
    .union([schema, z.array(schema), z.null()])
    .optional()
    .transform((value): z.output<T> | null => {
      if (!value) return null;
      return Array.isArray(value) ? (value[0] ?? null) : value;
    });
}

export const productRowSchema = z.object({
  id: z.coerce.number().int().positive(),
  nome: z.string().trim().min(1),
  id_categoria: z.coerce.number().int().positive().nullable().optional(),
  id_subcategoria: z.coerce.number().int().positive().nullable().optional(),
  descricao: nullableTextSchema,
  image_url: nullableTextSchema,
  product_categoria: relationSchema(productCategoryRelationSchema),
  product_subcategory: relationSchema(productSubcategoryRelationSchema),
});

export type ProductCategoryRelation = z.infer<
  typeof productCategoryRelationSchema
>;
export type ProductSubcategoryRelation = z.infer<
  typeof productSubcategoryRelationSchema
>;

export interface ProductRecord {
  id: number;
  nome: string;
  id_categoria: number | null;
  id_subcategoria: number | null;
  descricao: string | null;
  image_url: string | null;
  product_categoria: ProductCategoryRelation | null;
  product_subcategory: ProductSubcategoryRelation | null;
}

export function parseProductRecord(value: unknown): ProductRecord | null {
  const parsed = productRowSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  return {
    id: parsed.data.id,
    nome: parsed.data.nome,
    id_categoria: parsed.data.id_categoria ?? null,
    id_subcategoria: parsed.data.id_subcategoria ?? null,
    descricao: parsed.data.descricao,
    image_url: parsed.data.image_url,
    product_categoria: parsed.data.product_categoria,
    product_subcategory: parsed.data.product_subcategory,
  };
}

export function parseProductRecords(values: unknown[] | null | undefined) {
  return (values ?? [])
    .map(parseProductRecord)
    .filter((product): product is ProductRecord => product !== null);
}

export function getProductCategory(product: ProductRecord) {
  return product.product_categoria;
}

export function getProductSubcategory(product: ProductRecord) {
  return product.product_subcategory;
}

export function getSafeImageUrl(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (normalized.startsWith("/")) return normalized;

  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:"
      ? normalized
      : null;
  } catch {
    return null;
  }
}

export function getProductDescription(
  product: ProductRecord,
  fallback = "Consulte nossa equipe para mais informações sobre este produto."
) {
  return product.descricao ?? fallback;
}
