import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  parseProductRecord,
  parseProductRecords,
  type ProductRecord,
} from "@/features/products/types";

export const PRODUCT_SELECT =
  "id, codigo, nome, id_categoria, id_subcategoria, descricao, image_url, product_categoria(id, category), product_subcategory(id, subcategoria)";

export function parseProductId(rawId: string): number | null {
  const productId = Number(rawId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }
  return productId;
}

export const getProductById = cache(
  async (productId: number): Promise<ProductRecord | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", productId)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar produto ${productId}: ${error.message}`);
    }

    return parseProductRecord(data);
  }
);

export const getRelatedProducts = cache(
  async (
    productId: number,
    categoryId: number | null
  ): Promise<ProductRecord[]> => {
    if (!categoryId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id_categoria", categoryId)
      .neq("id", productId)
      .order("nome", { ascending: true })
      .limit(4);

    if (error) {
      throw new Error(
        `Erro ao buscar produtos relacionados para ${productId}: ${error.message}`
      );
    }

    return parseProductRecords(data);
  }
);
