import { z } from "zod";

export const FEATURED_SELECTOR_PAGE_SIZE = 15;

const optionalPositiveIdSchema = z
  .number()
  .int()
  .positive()
  .nullable()
  .optional()
  .transform((value) => value ?? null);

export const featuredSelectorInputSchema = z.object({
  page: z.number().int().positive(),
  search: z.string().trim().max(120).optional().default(""),
  categoryId: optionalPositiveIdSchema,
  subcategoryId: optionalPositiveIdSchema,
  excludedProductIds: z
    .array(z.number().int().positive())
    .max(10)
    .optional()
    .default([])
    .transform((ids) => [...new Set(ids)]),
});

export type FeaturedSelectorInput = z.input<
  typeof featuredSelectorInputSchema
>;

export interface FeaturedSelectableProduct {
  id: number;
  nome: string;
  imageUrl: string | null;
}

const featuredSelectableProductRowSchema = z.object({
  id: z.coerce.number().int().positive(),
  nome: z.string().trim().min(1),
  image_url: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value?.trim() || null),
});

export function normalizeFeaturedSelectableProducts(
  value: unknown
): FeaturedSelectableProduct[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((row) => {
    const parsed = featuredSelectableProductRowSchema.safeParse(row);
    return parsed.success
      ? [
          {
            id: parsed.data.id,
            nome: parsed.data.nome,
            imageUrl: parsed.data.image_url,
          },
        ]
      : [];
  });
}
