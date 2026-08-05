import { z } from "zod";
import {
  getProductDescription,
  parseProductRecords,
} from "@/features/products/types";
import type { ProductCategory } from "@/types";

const featuredProductRowSchema = z.object({
  id: z.coerce.number().int().positive(),
  product_id: z.coerce.number().int().positive(),
  display_order: z.coerce.number().int().positive(),
});

const featuredProductRowsSchema = z.array(featuredProductRowSchema);

export type FeaturedProductRow = z.infer<typeof featuredProductRowSchema>;

export type HomepageCarouselState =
  | {
      status: "ready";
      source: "featured" | "placeholder";
      products: ProductCategory[];
    }
  | {
      status: "error";
      reason:
        | "featured-query"
        | "featured-data"
        | "products-query"
        | "products-data";
    };

export function parseFeaturedProductRows(value: unknown) {
  const parsed = featuredProductRowsSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function resolveHomepageCarouselState({
  featuredRows,
  productRows,
  placeholderProducts,
}: {
  featuredRows: FeaturedProductRow[];
  productRows: unknown;
  placeholderProducts: readonly ProductCategory[];
}): HomepageCarouselState {
  if (featuredRows.length === 0) {
    return {
      status: "ready",
      source: "placeholder",
      products: [...placeholderProducts],
    };
  }

  if (!Array.isArray(productRows)) {
    return { status: "error", reason: "products-data" };
  }

  const products = parseProductRecords(productRows);
  if (products.length !== productRows.length) {
    return { status: "error", reason: "products-data" };
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const orderedRows = [...featuredRows].sort(
    (first, second) =>
      first.display_order - second.display_order || first.id - second.id
  );
  const mappedProducts: ProductCategory[] = [];

  for (const featured of orderedRows) {
    const product = productsById.get(featured.product_id);
    if (!product) {
      return { status: "error", reason: "products-data" };
    }

    mappedProducts.push({
      id: String(product.id),
      name: product.nome,
      description: getProductDescription(product),
      image: product.image_url,
    });
  }

  return {
    status: "ready",
    source: "featured",
    products: mappedProducts,
  };
}
